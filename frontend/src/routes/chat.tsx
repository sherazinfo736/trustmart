import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Package, Send } from "lucide-react";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyBlock, LoadingBlock } from "@/components/shell/StateBlock";
import { ScamWarningBanner } from "@/components/trust/ScamWarningBanner";
import { chatKeys, useChatMessages, useChatThreads } from "@/lib/api/queries";
import { api } from "@/lib/api/client";
import { detectScamPattern } from "@/lib/scam";
import { fixtures } from "@/mocks/adapter";
import { cn } from "@/lib/utils";
import type { ChatMessage, ScamPatternType } from "@/types";

type Search = { thread?: string; message?: string };

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search["thread"] === "string" ? { thread: search["thread"] } : {}),
    ...(typeof search["message"] === "string" ? { message: search["message"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Messages — TrustMart" },
      { name: "description", content: "Scam-monitored conversations with buyers and sellers." },
      { property: "og:title", content: "Messages — TrustMart" },
      { property: "og:description", content: "Scam-monitored conversations with buyers and sellers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit" });

function Page() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const threads = useChatThreads();
  const activeId = search.thread ?? threads.data?.[0]?.id;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageHeader
          title="Messages"
          description="Every conversation is monitored for scam patterns. TrustMart never asks for OTPs."
        />

        {threads.isLoading ? (
          <LoadingBlock rows={3} label="Loading conversations" />
        ) : !threads.data || threads.data.length === 0 ? (
          <EmptyBlock
            title="No conversations yet"
            description="Message a seller from any listing to start a monitored conversation."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className={cn("space-y-2", search.thread ? "hidden lg:block" : "block")}>
              {threads.data.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => void navigate({ to: "/chat", search: { thread: thread.id } })}
                  className={cn(
                    "tm-card w-full p-3 text-left transition-colors hover:border-primary/40",
                    thread.id === activeId && "border-primary/50 bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{thread.counterpartName}</p>
                    {thread.unread > 0 ? (
                      <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                        {thread.unread}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{thread.listingTitle}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-foreground/70">{thread.lastMessage}</p>
                  {thread.hasScamFlag ? (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                      <AlertTriangle className="size-3" aria-hidden /> Scam pattern flagged
                    </span>
                  ) : null}
                </button>
              ))}
            </aside>

            <div className={cn(search.thread ? "block" : "hidden lg:block")}>
              {activeId ? (
                <Thread
                  threadId={activeId}
                  thread={threads.data.find((t) => t.id === activeId) ?? null}
                  highlightId={search.message}
                />
              ) : (
                <EmptyBlock
                  title="Select a conversation"
                  description="Pick a thread on the left to read the monitored history."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

type ChatThreadSummary = NonNullable<ReturnType<typeof useChatThreads>["data"]>[number];

function Thread({
  threadId,
  thread,
  highlightId,
}: {
  threadId: string;
  thread: ChatThreadSummary | null;
  highlightId?: string | undefined;
}) {
  const messages = useChatMessages(threadId);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [acknowledgedDraftWarning, setAcknowledgedDraftWarning] = useState(false);

  const orderId = (thread as ChatThreadSummary & { orderId?: string | null } | null)?.orderId ?? null;
  const draftPattern = detectScamPattern(draft);

  useEffect(() => {
    setDraft("");
    setAcknowledgedDraftWarning(false);
    inputRef.current?.focus();
  }, [threadId]);

  const historicalFlag = useMemo<ScamPatternType | null>(() => {
    const flagged = (messages.data ?? []).filter((m) => m.scamFlag && m.scamPatternType);
    return flagged.length > 0 ? (flagged[flagged.length - 1]!.scamPatternType ?? null) : null;
  }, [messages.data]);

  const send = useMutation({
    mutationFn: (input: { body: string; scamPatternType: ScamPatternType | null }) =>
      api.sendChatMessage({ threadId, ...input }),
    onMutate: async (input) => {
      const key = chatKeys.messages(threadId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChatMessage[]>(key) ?? [];
      const optimistic: ChatMessage = {
        id: `optimistic_${Date.now()}`,
        threadId,
        senderId: fixtures.currentBuyer.id,
        body: input.body,
        scamFlag: !!input.scamPatternType,
        ...(input.scamPatternType ? { scamPatternType: input.scamPatternType } : {}),
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<ChatMessage[]>(key, [...previous, optimistic]);
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(chatKeys.messages(threadId), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.messages(threadId) });
      void queryClient.invalidateQueries({ queryKey: chatKeys.threads });
    },
  });

  const blockedBeforeSend = !!draftPattern && !acknowledgedDraftWarning;

  return (
    <section className="tm-card flex min-h-[560px] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" asChild>
              <Link to="/chat" search={{}} aria-label="Back to conversations">
                <ArrowLeft className="size-4" aria-hidden />
              </Link>
            </Button>
            <p className="truncate font-semibold">{thread?.counterpartName}</p>
          </div>
          <p className="truncate text-xs text-muted-foreground">{thread?.listingTitle}</p>
        </div>
        {orderId ? (
          <Button variant="outline" size="sm" asChild>
            <Link to="/orders/$orderId" params={{ orderId }}>
              <Package className="size-4" aria-hidden /> View order
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.isLoading ? (
          <LoadingBlock rows={3} label="Loading messages" />
        ) : (
          <>
            {historicalFlag ? <ScamWarningBanner pattern={historicalFlag} /> : null}
            {(messages.data ?? []).map((message) => {
              const mine = message.senderId === fixtures.currentBuyer.id;
              return (
                <div
                  key={message.id}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg border px-3 py-2 text-sm sm:max-w-[70%]",
                      message.scamFlag
                        ? "border-destructive/30 bg-destructive/10"
                        : mine
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border bg-muted",
                      message.id === highlightId && "ring-2 ring-destructive ring-offset-2",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.body}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        mine && !message.scamFlag
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {timeLabel(message.createdAt)}
                      {message.scamFlag ? " · flagged" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="space-y-3 border-t border-border p-4">
        {draftPattern && !acknowledgedDraftWarning ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-destructive">
                  This message matches a known scam pattern
                </p>
                <p className="mt-1 text-sm text-foreground/80">
                  Acknowledge the warning before sending. Never pay outside escrow and never share an
                  OTP.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setAcknowledgedDraftWarning(true)}
                  >
                    I understand, let me send
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/report-scam" search={{ subject: `${threadId} — ${thread?.counterpartName ?? ""} (${thread?.listingTitle ?? ""})` }}>
                      Report instead
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim() || blockedBeforeSend) return;
            send.mutate({ body: draft.trim(), scamPatternType: draftPattern });
            setDraft("");
            setAcknowledgedDraftWarning(false);
            inputRef.current?.focus();
          }}
        >
          <Textarea
            ref={inputRef}
            rows={2}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setAcknowledgedDraftWarning(false);
            }}
            placeholder="Write a message — payments stay inside escrow"
            aria-label="Message"
            className="min-h-[52px] resize-none"
          />
          <Button type="submit" disabled={!draft.trim() || blockedBeforeSend || send.isPending}>
            <Send className="size-4" aria-hidden /> Send
          </Button>
        </form>
      </div>
    </section>
  );
}
