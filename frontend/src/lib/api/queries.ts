import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "./client";
import { fixtures } from "@/mocks/adapter";
import { joinThreadRoom } from "@/lib/realtime";

/** Query keys are scoped: [surface, userId, feature, resourceId, filters] */
const buyer = fixtures.currentBuyer.id;
const seller = fixtures.currentSeller.id;

export const useListings = (filters: {
  categorySlug?: string;
  query?: string;
  verifiedOnly?: boolean;
}) =>
  useQuery({
    queryKey: ["public", "anon", "listings", null, filters],
    queryFn: () => api.listings(filters).then((r) => r.data),
  });

export const useListing = (id: string) =>
  useQuery({
    queryKey: ["public", "anon", "listing", id, null],
    queryFn: () => api.listing(id).then((r) => r.data),
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["public", "anon", "categories", null, null],
    queryFn: () => api.categories().then((r) => r.data),
  });

export const useBuyerOrders = () =>
  useQuery({
    queryKey: ["buyer", buyer, "orders", null, null],
    queryFn: () => api.orders().then((r) => r.data),
  });

export const useBuyerOrder = (id: string) =>
  useQuery({
    queryKey: ["buyer", buyer, "order", id, null],
    queryFn: () => api.order(id).then((r) => r.data),
  });

export const useChatThreads = () =>
  useQuery({
    queryKey: ["buyer", buyer, "chat-threads", null, null],
    queryFn: () => api.chatThreads().then((r) => r.data),
  });

export const useChatMessages = (threadId: string) => {
  useEffect(() => {
    joinThreadRoom(threadId);
  }, [threadId]);

  return useQuery({
    queryKey: ["buyer", buyer, "chat-messages", threadId, null],
    queryFn: () => api.chatMessages(threadId).then((r) => r.data),
  });
};

export const useCertificates = () =>
  useQuery({
    queryKey: ["buyer", buyer, "certificates", null, null],
    queryFn: () => api.certificates().then((r) => r.data),
  });

export const useSellerListings = () =>
  useQuery({
    queryKey: ["seller", seller, "listings", null, null],
    queryFn: () => api.sellerListings().then((r) => r.data),
  });

export const useSellerPayouts = () =>
  useQuery({
    queryKey: ["seller", seller, "payouts", null, null],
    queryFn: () => api.payouts().then((r) => r.data),
  });

export const useSellerOrders = () =>
  useQuery({
    queryKey: ["seller", seller, "orders", null, null],
    queryFn: () => api.orders().then((r) => r.data),
  });

export const useTrustScoreTrend = () =>
  useQuery({
    queryKey: ["seller", seller, "trust-trend", null, null],
    queryFn: () => api.trustScoreTrend().then((r) => r.data),
  });

export const useFraudQueue = () =>
  useQuery({
    queryKey: ["admin", "fraud-queue", null, null],
    queryFn: () => api.fraudQueue().then((r) => r.data),
  });

export const useAdminDisputes = () =>
  useQuery({
    queryKey: ["admin", "disputes", null, null],
    queryFn: () => api.disputes().then((r) => r.data),
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin", "users", null, null],
    queryFn: () => api.users().then((r) => r.data),
  });

export const useAdminRevenue = () =>
  useQuery({
    queryKey: ["admin", "revenue", null, null],
    queryFn: () => api.revenue().then((r) => r.data),
  });

export const useAdminEscrowOrders = () =>
  useQuery({
    queryKey: ["admin", "escrow-orders", null, null],
    queryFn: () => api.orders().then((r) => r.data),
  });
// ── Public / buyer surfaces ────────────────────────────────────────────────
export type BrowseFilters = {
  categorySlug?: string;
  query?: string;
  verifiedOnly?: boolean;
  condition?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "recent" | "price-asc" | "price-desc" | "trust";
};

export const usePublicListings = (filters: BrowseFilters) =>
  useQuery({
    queryKey: ["public", "anon", "public-listings", null, filters],
    queryFn: () => api.publicListings(filters).then((r) => r.data),
  });

export const useCities = () =>
  useQuery({
    queryKey: ["public", "anon", "cities", null, null],
    queryFn: () => api.cities().then((r) => r.data),
  });

export const useSellerProfile = (sellerId: string) =>
  useQuery({
    queryKey: ["public", "anon", "seller-profile", sellerId, null],
    queryFn: () => api.sellerProfile(sellerId).then((r) => r.data),
  });

export const useReviews = (sellerId?: string) =>
  useQuery({
    queryKey: ["public", "anon", "reviews", sellerId ?? null, null],
    queryFn: () => api.reviews(sellerId).then((r) => r.data),
  });

export const useSavedListings = () =>
  useQuery({
    queryKey: ["buyer", buyer, "saved-listings", null, null],
    queryFn: () => api.savedListings().then((r) => r.data),
  });

export const useNotifications = () =>
  useQuery({
    queryKey: ["buyer", buyer, "notifications", null, null],
    queryFn: () => api.notifications().then((r) => r.data),
  });

export const useDispute = (id: string) =>
  useQuery({
    queryKey: ["buyer", buyer, "dispute", id, null],
    queryFn: () => api.dispute(id).then((r) => r.data),
  });

export const useCertificateForOrder = (orderId: string) =>
  useQuery({
    queryKey: ["buyer", buyer, "certificate-for-order", orderId, null],
    queryFn: () => api.certificateForOrder(orderId).then((r) => r.data),
  });

export const useCheckoutQuote = (listingId: string) =>
  useQuery({
    queryKey: ["buyer", buyer, "checkout-quote", listingId, null],
    queryFn: () => api.checkoutQuote(listingId).then((r) => r.data),
  });

export const useBuyerTrustScore = () =>
  useQuery({
    queryKey: ["buyer", buyer, "trust-score", null, null],
    queryFn: () => api.buyerTrustScore().then((r) => r.data),
  });

export const useScamReports = () =>
  useQuery({
    queryKey: ["buyer", buyer, "scam-reports", null, null],
    queryFn: () => api.scamReports().then((r) => r.data),
  });

export const orderKeys = {
  list: ["buyer", buyer, "orders", null, null] as const,
  detail: (id: string) => ["buyer", buyer, "order", id, null] as const,
};

export const chatKeys = {
  threads: ["buyer", buyer, "chat-threads", null, null] as const,
  messages: (id: string) => ["buyer", buyer, "chat-messages", id, null] as const,
};

export const disputeKeys = {
  detail: (id: string) => ["buyer", buyer, "dispute", id, null] as const,
};
