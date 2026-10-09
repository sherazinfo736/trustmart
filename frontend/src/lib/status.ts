import type {
  DisputeStatus,
  EscrowState,
  ListingStatus,
  OrderStatus,
  PayoutStatus,
  RiskLevel,
  VerificationStatus,
} from "@/types";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

export const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  info: "bg-info/10 text-info border-info/25",
  primary: "bg-primary/10 text-primary border-primary/25",
};

export const riskTone: Record<RiskLevel, Tone> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export const listingStatusTone: Record<ListingStatus, Tone> = {
  DRAFT: "neutral",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  SOLD: "info",
  FLAGGED: "danger",
  UNDER_REVIEW: "warning",
  REMOVED: "danger",
  EXPIRED: "neutral",
  ARCHIVED: "neutral",
};

export const orderStatusTone: Record<OrderStatus, Tone> = {
  PLACED: "neutral",
  PAYMENT_PENDING: "warning",
  PAYMENT_CONFIRMED: "primary",
  SHIPPED: "info",
  DELIVERED: "info",
  COMPLETED: "success",
  DISPUTED: "danger",
  CANCELLED: "neutral",
  REFUNDED: "warning",
};

export const escrowStateTone: Record<EscrowState, Tone> = {
  HELD: "primary",
  RELEASED: "success",
  REFUNDED: "warning",
  SPLIT: "info",
};

export const payoutStatusTone: Record<PayoutStatus, Tone> = {
  PENDING: "warning",
  ON_HOLD: "danger",
  PROCESSED: "success",
  FAILED: "danger",
};

export const disputeStatusTone: Record<DisputeStatus, Tone> = {
  OPENED: "warning",
  EVIDENCE_COLLECTION: "info",
  UNDER_REVIEW: "warning",
  ESCALATED: "danger",
  RESOLVED: "success",
};

export const verificationTone: Record<VerificationStatus, Tone> = {
  UNVERIFIED: "neutral",
  PENDING: "warning",
  VERIFIED: "primary",
  REJECTED: "danger",
};

export const humanize = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");