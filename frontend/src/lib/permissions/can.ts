import type { AnyRole, User } from "@/types";

/** Permission keys — components never check role names directly. */
export type PermissionKey =
  | "listing.create"
  | "listing.publish.lowMedium"
  | "listing.publish.high"
  | "listing.moderate"
  | "fraud.review"
  | "fraud.escalate"
  | "escrow.view"
  | "escrow.hold"
  | "escrow.release.flagged"
  | "payout.view"
  | "payout.process"
  | "trustScore.override"
  | "dispute.recommend"
  | "dispute.decide"
  | "user.suspend"
  | "user.verifyManually"
  | "revenue.view"
  | "ai.monitor"
  | "cms.manage"
  | "roles.manage"
  | "system.view"
  | "store.manage"
  | "team.manage";

const rolePermissions: Record<AnyRole, PermissionKey[]> = {
  BUYER: [],
  SELLER: ["listing.create", "listing.publish.lowMedium", "payout.view", "dispute.recommend"],
  BUSINESS_SELLER: [
    "listing.create",
    "listing.publish.lowMedium",
    "payout.view",
    "dispute.recommend",
    "store.manage",
    "team.manage",
  ],
  TEAM_MEMBER: ["listing.create", "dispute.recommend"],
  SUPPORT_AGENT: ["escrow.view", "dispute.recommend", "listing.moderate"],
  FRAUD_ANALYST: [
    "fraud.review",
    "fraud.escalate",
    "listing.moderate",
    "listing.publish.high",
    "escrow.view",
    "dispute.recommend",
    "ai.monitor",
  ],
  FINANCE_ADMIN: ["escrow.view", "payout.view", "payout.process", "revenue.view"],
  SENIOR_ADMIN: [
    "fraud.review",
    "fraud.escalate",
    "listing.moderate",
    "listing.publish.high",
    "escrow.view",
    "escrow.hold",
    "escrow.release.flagged",
    "payout.view",
    "payout.process",
    "trustScore.override",
    "dispute.recommend",
    "dispute.decide",
    "user.suspend",
    "user.verifyManually",
    "revenue.view",
    "ai.monitor",
    "system.view",
  ],
  SUPER_ADMIN: [
    "listing.create",
    "listing.publish.lowMedium",
    "listing.publish.high",
    "listing.moderate",
    "fraud.review",
    "fraud.escalate",
    "escrow.view",
    "escrow.hold",
    "escrow.release.flagged",
    "payout.view",
    "payout.process",
    "trustScore.override",
    "dispute.recommend",
    "dispute.decide",
    "user.suspend",
    "user.verifyManually",
    "revenue.view",
    "ai.monitor",
    "cms.manage",
    "roles.manage",
    "system.view",
    "store.manage",
    "team.manage",
  ],
};

export function can(user: Pick<User, "role"> | null | undefined, action: PermissionKey) {
  if (!user) return false;
  return rolePermissions[user.role]?.includes(action) ?? false;
}

export const permissionsFor = (role: AnyRole) => rolePermissions[role] ?? [];