import { config } from "./client";
import type { ApiSuccess } from "@/types";

/**
 * Real backend implementation of the same method surface `mockApi` exposes
 * (see src/mocks/adapter.ts). Every method here returns the exact same
 * shape mockApi's equivalent method returns, so swapping `api = mockApi`
 * for `api = httpApi` in client.ts is a one-line change — no component
 * needs to know which one it's talking to.
 *
 * SESSION NOTE: Auth screens (PW-01) aren't wired into the UI yet. Until
 * they are, this file silently signs in as one of three fixed demo
 * accounts (buyer / seller / admin) using the backend's real OTP flow, so
 * every read/write below still hits real, authenticated endpoints instead
 * of stubbing auth out. Once PW-01 exists, replace `ensureSession()` with
 * the real login flow's stored token and delete the DEMO_ACCOUNTS block.
 */

const DEMO_ACCOUNTS = {
  buyer: "+92 300 1234567",
  seller: "+92 321 7654321",
  admin: "+92 333 9990000",
} as const;

type Role = keyof typeof DEMO_ACCOUNTS;

async function rawFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.message ?? `Request failed (${res.status})`;
    throw { code: json?.code ?? "REQUEST_FAILED", message, requestId: json?.requestId };
  }
  return json;
}

async function loginAs(role: Role): Promise<string> {
  const phone = DEMO_ACCOUNTS[role];
  const otpRes = await rawFetch("/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ phone, purpose: "LOGIN" }),
  });
  const { otpId, devOtp } = otpRes.data;
  const verifyRes = await rawFetch("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ otpId, code: devOtp }),
  });
  const token = verifyRes.data.accessToken as string;
  sessionStorage.setItem(`trustmart_token_${role}`, token);
  return token;
}

async function ensureSession(role: Role = "buyer"): Promise<string> {
  const existing = sessionStorage.getItem(`trustmart_token_${role}`);
  if (existing) return existing;
  return loginAs(role);
}

async function authedFetch(path: string, role: Role, init: RequestInit = {}) {
  const token = await ensureSession(role);
  try {
    return await rawFetch(path, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` } });
  } catch (e: any) {
    // Token expired mid-session — re-authenticate once and retry.
    if (e?.code === "UNAUTHORIZED") {
      sessionStorage.removeItem(`trustmart_token_${role}`);
      const fresh = await ensureSession(role);
      return rawFetch(path, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${fresh}` } });
    }
    throw e;
  }
}

const qs = (params: Record<string, unknown>) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  const s = usp.toString();
  return s ? `?${s}` : "";
};

export const httpApi = {
  async listings(filters?: { categorySlug?: string; query?: string; verifiedOnly?: boolean }) {
    return rawFetch(`/listings${qs(filters ?? {})}`) as Promise<ApiSuccess<any[]>>;
  },

  async publicListings(filters?: {
    categorySlug?: string; query?: string; verifiedOnly?: boolean; condition?: string;
    city?: string; minPrice?: number; maxPrice?: number; sort?: "recent" | "price-asc" | "price-desc" | "trust";
  }) {
    const { sort, ...rest } = filters ?? {};
    return rawFetch(`/listings${qs({ ...rest, sort: sort === "recent" ? undefined : sort })}`) as Promise<ApiSuccess<any[]>>;
  },

  async cities() {
    return rawFetch("/cities") as Promise<ApiSuccess<string[]>>;
  },

  async savedListings() {
    return authedFetch("/me/saved-listings", "buyer") as Promise<ApiSuccess<any[]>>;
  },

  async sellerProfile(sellerId: string) {
    return rawFetch(`/sellers/${sellerId}/profile`) as Promise<ApiSuccess<any>>;
  },

  async reviews(sellerId?: string) {
    return rawFetch(`/reviews${qs({ sellerId })}`) as Promise<ApiSuccess<any[]>>;
  },

  async notifications() {
    return authedFetch("/me/notifications", "buyer") as Promise<ApiSuccess<any[]>>;
  },

  async dispute(id: string) {
    return rawFetch(`/disputes/${id}`) as Promise<ApiSuccess<any>>;
  },

  async certificateForOrder(orderId: string) {
    return rawFetch(`/orders/${orderId}/certificate`) as Promise<ApiSuccess<any>>;
  },

  async checkoutQuote(listingId: string) {
    return rawFetch(`/checkout/${listingId}/quote`) as Promise<ApiSuccess<any>>;
  },

  async buyerTrustScore() {
    return authedFetch("/me/trust-score", "buyer") as Promise<ApiSuccess<any>>;
  },

  async listing(id: string) {
    return rawFetch(`/listings/${id}`) as Promise<ApiSuccess<any>>;
  },

  async categories() {
    return rawFetch("/categories") as Promise<ApiSuccess<any[]>>;
  },

  async orders() {
    return authedFetch("/orders", "buyer") as Promise<ApiSuccess<any[]>>;
  },

  async order(id: string) {
    return rawFetch(`/orders/${id}`) as Promise<ApiSuccess<any>>;
  },

  // NOTE: backend returns the full order-detail bundle (order+escrow+etc) since
  // it recomputes everything transactionally; mockApi's shape is just the bare
  // order. We unwrap `.order` here so callers see the identical shape either way.
  async confirmReceipt(orderId: string) {
    const res = await authedFetch(`/orders/${orderId}/confirm-receipt`, "buyer", { method: "POST" });
    return { ...res, data: res.data?.order ?? null } as ApiSuccess<any>;
  },

  async chatThreads() {
    return authedFetch("/chat/threads", "buyer") as Promise<ApiSuccess<any[]>>;
  },

  async chatMessages(threadId: string) {
    return authedFetch(`/chat/threads/${threadId}/messages`, "buyer") as Promise<ApiSuccess<any[]>>;
  },

  async sendChatMessage(input: { threadId: string; body: string; scamPatternType?: any }) {
    // scamPatternType is intentionally ignored here — the real backend runs its
    // own server-side pattern detection on the message body, which is the
    // authoritative source now instead of the client pre-labeling it.
    return authedFetch(`/chat/threads/${input.threadId}/messages`, "buyer", {
      method: "POST",
      body: JSON.stringify({ body: input.body }),
    }) as Promise<ApiSuccess<any>>;
  },

  async scamReports() {
    return authedFetch("/scam-reports", "buyer") as Promise<ApiSuccess<any[]>>;
  },

  async submitScamReport(input: { subject: string; reason: string; details: string; evidenceCount: number }) {
    // Matches mockApi's raw (non-ApiSuccess-wrapped) { duplicate, report } shape.
    return authedFetch("/scam-reports", "buyer", { method: "POST", body: JSON.stringify(input) }) as Promise<{
      duplicate: any; report: any;
    }>;
  },

  async addDisputeEvidence(input: {
    disputeId: string; evidenceType: string; label: string; sourceThreadId?: string; sourceMessageId?: string;
  }) {
    const { disputeId, ...body } = input;
    return authedFetch(`/disputes/${disputeId}/evidence`, "buyer", {
      method: "POST",
      body: JSON.stringify(body),
    }) as Promise<ApiSuccess<any>>;
  },

  async certificates() {
    return authedFetch("/me/certificates", "buyer") as Promise<ApiSuccess<any[]>>;
  },

  async disputes() {
    return authedFetch("/disputes", "buyer") as Promise<ApiSuccess<any[]>>;
  },

  async payouts() {
    return authedFetch("/seller/payouts", "seller") as Promise<ApiSuccess<any[]>>;
  },

  async sellerListings() {
    return authedFetch("/seller/listings", "seller") as Promise<ApiSuccess<any[]>>;
  },

  async fraudQueue() {
    return authedFetch("/admin/fraud-queue", "admin") as Promise<ApiSuccess<any[]>>;
  },

  async riskBreakdown(listingId: string) {
    return rawFetch(`/listings/${listingId}/risk`) as Promise<ApiSuccess<any>>;
  },

  async revenue() {
    return authedFetch("/admin/revenue", "admin") as Promise<ApiSuccess<any[]>>;
  },

  async trustScoreTrend() {
    return authedFetch("/seller/trust-trend", "seller") as Promise<ApiSuccess<any[]>>;
  },

  async users() {
    return authedFetch("/admin/users", "admin") as Promise<ApiSuccess<any[]>>;
  },

  // ── Extras available on the real backend but not yet in mockApi's surface ──
  // (Fraud Review Queue decide, checkout/payment, escrow release, etc. — wire
  // these in as the Seller/Admin dashboard screens get built against them.)
  async decideFraudItem(itemId: string, decision: "CLEARED" | "REJECTED" | "ESCALATED", note?: string) {
    return authedFetch(`/admin/fraud-queue/${itemId}/decide`, "admin", {
      method: "POST",
      body: JSON.stringify({ decision, note }),
    }) as Promise<ApiSuccess<any>>;
  },

  async checkout(listingId: string, provider: "JAZZCASH" | "EASYPAISA" | "RAAST" | "CARD") {
    return authedFetch(`/checkout/${listingId}`, "buyer", {
      method: "POST",
      body: JSON.stringify({ provider }),
    }) as Promise<ApiSuccess<{ orderId: string; orderNumber: string; status: string }>>;
  },

  async releaseEscrow(orderId: string) {
    return authedFetch(`/admin/escrow/${orderId}/release`, "admin", { method: "POST" }) as Promise<ApiSuccess<any>>;
  },

  async decideDispute(disputeId: string, decision: "RELEASE_SELLER" | "REFUND_BUYER" | "SPLIT") {
    return authedFetch(`/disputes/${disputeId}/decide`, "admin", {
      method: "POST",
      body: JSON.stringify({ decision }),
    }) as Promise<ApiSuccess<any>>;
  },
};
