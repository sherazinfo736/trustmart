import * as f from "./fixtures";
import type { ApiSuccess } from "@/types";

/**
 * Mock adapter — the ONLY place demo fixtures are read.
 * Swapping to the real API is a config change (VITE_USE_MOCK_API=false),
 * not a component rewrite.
 */
export type MockScenario =
  | "success"
  | "empty"
  | "loading"
  | "validation-failure"
  | "permission-denied"
  | "network-failure"
  | "ai-unavailable"
  | "verification-pending"
  | "verification-rejected"
  | "escrow-held"
  | "escrow-release-blocked"
  | "payout-processing"
  | "dispute-escalated"
  | "risk-flagged";

const delay = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

const ok = <T,>(data: T, total?: number): ApiSuccess<T> => ({
  data,
  ...(total === undefined ? {} : { meta: { total } }),
  requestId: `demo_${Math.random().toString(36).slice(2, 8)}`,
});

export const mockApi = {
  async listings(filters?: { categorySlug?: string; query?: string; verifiedOnly?: boolean }) {
    await delay();
    let rows = f.listings;
    // HIGH risk listings are never surfaced in public grids.
    rows = rows.filter((l) => l.riskLevel !== "HIGH" && l.status === "PUBLISHED");
    if (filters?.categorySlug) {
      const cat = f.categories.find((c) => c.slug === filters.categorySlug);
      rows = rows.filter((l) => l.categoryId === cat?.id);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      rows = rows.filter(
        (l) => l.title.toLowerCase().includes(q) || l.publicId.toLowerCase().includes(q),
      );
    }
    if (filters?.verifiedOnly) rows = rows.filter((l) => l.riskLevel === "LOW");
    // Risk + verification signals are part of the API response, not a
    // side-channel the UI reaches into separately — same contract the real
    // backend follows, so screens never care which one they're talking to.
    return ok(
      rows.map((l) => ({
        ...l,
        risk: f.riskFor(l.id),
        verifiedFields: f.productVerifications[l.id]?.verifiedFields ?? {},
      })),
      rows.length,
    );
  },
  async publicListings(filters?: {
    categorySlug?: string;
    query?: string;
    verifiedOnly?: boolean;
    condition?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: "recent" | "price-asc" | "price-desc" | "trust";
  }) {
    const base = await mockApi.listings(filters);
    let rows = base.data;
    if (filters?.condition) rows = rows.filter((l) => l.condition === filters.condition);
    if (filters?.city) rows = rows.filter((l) => l.city === filters.city);
    if (filters?.minPrice) rows = rows.filter((l) => l.pricePKR >= filters.minPrice!);
    if (filters?.maxPrice) rows = rows.filter((l) => l.pricePKR <= filters.maxPrice!);
    const sorted = [...rows];
    if (filters?.sort === "price-asc") sorted.sort((a, b) => a.pricePKR - b.pricePKR);
    else if (filters?.sort === "price-desc") sorted.sort((a, b) => b.pricePKR - a.pricePKR);
    else if (filters?.sort === "trust")
      sorted.sort((a, b) => (f.riskFor(a.id)?.overall ?? 50) - (f.riskFor(b.id)?.overall ?? 50));
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(sorted, sorted.length);
  },
  async cities() {
    await delay(120);
    return ok([...new Set(f.listings.map((l) => l.city))].sort());
  },
  async savedListings() {
    await delay();
    const rows = f.listings.filter((l) => f.savedListingIds.includes(l.id));
    return ok(
      rows.map((l) => ({
        ...l,
        risk: f.riskFor(l.id),
        verifiedFields: f.productVerifications[l.id]?.verifiedFields ?? {},
      })),
    );
  },
  async sellerProfile(sellerId: string) {
    await delay();
    const seller = f.sellers.find((s) => s.id === sellerId) ?? null;
    const rows = f.listings.filter(
      (l) => l.sellerId === sellerId && l.riskLevel !== "HIGH" && l.status === "PUBLISHED",
    );
    return ok(
      seller && {
        seller,
        listings: rows.map((l) => ({
          ...l,
          risk: f.riskFor(l.id),
          verifiedFields: f.productVerifications[l.id]?.verifiedFields ?? {},
        })),
        reviews: f.reviews.filter((r) => r.sellerId === sellerId),
      },
    );
  },
  async reviews(sellerId?: string) {
    await delay();
    return ok(sellerId ? f.reviews.filter((r) => r.sellerId === sellerId) : f.reviews);
  },
  async notifications() {
    await delay(220);
    return ok(f.notifications);
  },
  async dispute(id: string) {
    await delay();
    const dispute = f.disputes.find((d) => d.id === id) ?? null;
    const order = dispute ? (f.orders.find((o) => o.id === dispute.orderId) ?? null) : null;
    return ok(
      dispute && {
        dispute,
        order,
        buyer: f.currentBuyer,
        seller: order ? (f.sellers.find((s) => s.id === order.sellerId) ?? null) : null,
        listing: order ? (f.listings.find((l) => l.id === order.listingId) ?? null) : null,
      },
    );
  },
  async certificateForOrder(orderId: string) {
    await delay();
    return ok(f.certificates.find((c) => c.orderId === orderId) ?? null);
  },
  async checkoutQuote(listingId: string) {
    await delay(200);
    const listing = f.listings.find((l) => l.id === listingId) ?? null;
    return ok(listing && { listing, quote: f.escrowQuote(listing.pricePKR) });
  },
  async buyerTrustScore() {
    await delay();
    return ok(f.buyerTrustScore);
  },
  async listing(id: string) {
    await delay();
    const listing = f.listings.find((l) => l.id === id) ?? null;
    return ok(
      listing && {
        listing,
        seller: f.sellers.find((s) => s.id === listing.sellerId) ?? null,
        verification: f.productVerifications[listing.id] ?? null,
        category: f.categories.find((c) => c.id === listing.categoryId) ?? null,
        risk: f.riskFor(listing.id),
        discrepancies: f.verificationDiscrepancies[listing.id] ?? [],
      },
    );
  },
  async categories() {
    await delay(160);
    return ok(f.categories);
  },
  async orders() {
    await delay();
    const rows = f.buyerOrders();
    return ok(rows, rows.length);
  },
  async order(id: string) {
    await delay();
    const order = f.orders.find((o) => o.id === id) ?? null;
    return ok(
      order && {
        order,
        escrow: f.escrowTransactions[order.id] ?? null,
        listing: f.listings.find((l) => l.id === order.listingId) ?? null,
        seller: f.sellers.find((s) => s.id === order.sellerId) ?? null,
        dispute: f.disputeForOrder(order.id),
        releaseBlock: f.escrowReleaseBlock[order.id] ?? null,
        autoReleased: f.isAutoReleased(order),
        thread: f.chatThreads.find((t) => f.threadOrderLinks[t.id] === order.id) ?? null,
      },
    );
  },
  async confirmReceipt(orderId: string) {
    await delay(600);
    const order = f.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = "COMPLETED";
      order.confirmedReceiptAt = new Date().toISOString();
      const escrow = f.escrowTransactions[orderId];
      if (escrow) {
        escrow.state = "RELEASED";
        escrow.releasedAt = new Date().toISOString();
      }
    }
    return ok(order ?? null);
  },
  async chatThreads() {
    await delay();
    return ok(
      f.chatThreads.map((t) => ({ ...t, orderId: f.threadOrderLinks[t.id] ?? null })),
    );
  },
  async chatMessages(threadId: string) {
    await delay(200);
    return ok(f.chatMessages[threadId] ?? []);
  },
  async sendChatMessage(input: {
    threadId: string;
    body: string;
    scamPatternType?: import("@/types").ScamPatternType | null;
  }) {
    await delay(500);
    const message: import("@/types").ChatMessage = {
      id: `cm_${Math.random().toString(36).slice(2, 8)}`,
      threadId: input.threadId,
      senderId: f.currentBuyer.id,
      body: input.body,
      scamFlag: !!input.scamPatternType,
      ...(input.scamPatternType ? { scamPatternType: input.scamPatternType } : {}),
      createdAt: new Date().toISOString(),
    };
    f.chatMessages[input.threadId] = [...(f.chatMessages[input.threadId] ?? []), message];
    const thread = f.chatThreads.find((t) => t.id === input.threadId);
    if (thread) {
      thread.lastMessage = input.body;
      if (message.scamFlag) thread.hasScamFlag = true;
    }
    return ok(message);
  },
  async scamReports() {
    await delay(160);
    return ok(f.scamReports);
  },
  async submitScamReport(input: {
    subject: string;
    reason: string;
    details: string;
    evidenceCount: number;
  }) {
    await delay(600);
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const duplicate = f.scamReports.find(
      (r) => r.subject === input.subject && new Date(r.createdAt).getTime() > dayAgo,
    );
    if (duplicate) return { duplicate, report: null };
    const report: f.ScamReport = {
      id: `sr_${Math.random().toString(36).slice(2, 8)}`,
      ...input,
      createdAt: new Date().toISOString(),
    };
    f.scamReports.push(report);
    return { duplicate: null, report };
  },
  async addDisputeEvidence(input: {
    disputeId: string;
    evidenceType: import("@/types").DisputeEvidence["evidenceType"];
    label: string;
    sourceThreadId?: string;
    sourceMessageId?: string;
  }) {
    await delay(500);
    const dispute = f.disputes.find((d) => d.id === input.disputeId);
    if (!dispute) return ok(null);
    dispute.evidence = [
      ...dispute.evidence,
      {
        id: `ev_${Math.random().toString(36).slice(2, 8)}`,
        submittedBy: f.currentBuyer.id,
        evidenceType: input.evidenceType,
        url: "#",
        label: input.label,
        ...(input.sourceThreadId ? { sourceThreadId: input.sourceThreadId } : {}),
        ...(input.sourceMessageId ? { sourceMessageId: input.sourceMessageId } : {}),
        submittedAt: new Date().toISOString(),
      },
    ];
    return ok(dispute);
  },
  async certificates() {
    await delay();
    return ok(f.certificates);
  },
  async disputes() {
    await delay();
    return ok(f.disputes);
  },
  async payouts() {
    await delay();
    return ok(f.payouts);
  },
  async sellerListings() {
    await delay();
    return ok(f.listings.filter((l) => l.sellerId === f.currentSeller.id));
  },
  async fraudQueue() {
    await delay();
    return ok(f.fraudQueue, f.fraudQueue.length);
  },
  async riskBreakdown(listingId: string) {
    await delay(240);
    return ok(f.riskFor(listingId));
  },
  async revenue() {
    await delay();
    return ok(f.revenueSeries);
  },
  async trustScoreTrend() {
    await delay();
    return ok(f.trustScoreTrend);
  },
  async users() {
    await delay();
    return ok([f.currentBuyer, ...f.sellers], f.sellers.length + 1);
  },
};

export const fixtures = f;