import { io, type Socket } from "socket.io-client";
import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { config } from "./api/client";
import { fixtures } from "@/mocks/adapter";

/**
 * Live backend wiring. When VITE_USE_MOCK_API=false, this connects to the
 * NestJS backend's Socket.IO gateway and pushes real-time updates straight
 * into the TanStack Query cache, so screens update without polling:
 *
 *  - order:update  -> refetches the affected order + the orders list
 *  - chat:message   -> appends the message into that thread's cache instantly
 *                      and refreshes the thread list (lastMessage/scam flag)
 *  - fraud:update   -> refetches the admin fraud queue
 *
 * In mock mode this is a no-op — no socket connection is attempted, since
 * there's no backend to connect to.
 */

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (config.useMock) return null;
  if (!socket) {
    socket = io(config.baseUrl, { transports: ["websocket", "polling"], autoConnect: true });
  }
  return socket;
}

export function joinThreadRoom(threadId: string) {
  getSocket()?.emit("join:thread", threadId);
}

export function joinAdminRoom() {
  getSocket()?.emit("join:admin");
}

export function joinUserRoom(userId: string) {
  getSocket()?.emit("join:user", userId);
}

const buyerId = fixtures.currentBuyer.id;
const sellerId = fixtures.currentSeller.id;

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (config.useMock) return; // nothing to connect to in demo/mock mode

    const s = getSocket();
    if (!s) return;

    joinUserRoom(buyerId);
    joinUserRoom(sellerId);
    joinAdminRoom();

    const onOrderUpdate = (payload: { orderId: string; status: string }) => {
      queryClient.invalidateQueries({ queryKey: ["buyer", buyerId, "order", payload.orderId, null] });
      queryClient.invalidateQueries({ queryKey: ["buyer", buyerId, "orders", null, null] });
      queryClient.invalidateQueries({ queryKey: ["seller", sellerId, "orders", null, null] });
      queryClient.invalidateQueries({ queryKey: ["admin", "escrow", null, null] });
    };

    const onChatMessage = (message: {
      id: string; threadId: string; senderId: string; body: string;
      scamFlag: boolean; scamPatternType?: string; createdAt: string;
    }) => {
      queryClient.setQueryData(
        ["buyer", buyerId, "chat-messages", message.threadId, null],
        (existing: unknown) => {
          const list = Array.isArray(existing) ? existing : [];
          if (list.some((m: any) => m.id === message.id)) return list; // avoid dupes if we sent it ourselves
          return [...list, message];
        },
      );
      queryClient.invalidateQueries({ queryKey: ["buyer", buyerId, "chat-threads", null, null] });
    };

    const onFraudUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "fraud-queue", null, null] });
    };

    s.on("order:update", onOrderUpdate);
    s.on("chat:message", onChatMessage);
    s.on("fraud:update", onFraudUpdate);

    return () => {
      s.off("order:update", onOrderUpdate);
      s.off("chat:message", onChatMessage);
      s.off("fraud:update", onFraudUpdate);
    };
  }, [queryClient]);

  return children;
}
