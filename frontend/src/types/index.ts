// ── TrustMart shared domain models (frontend contracts only) ──

export type BuyerSellerRole = "BUYER" | "SELLER" | "BUSINESS_SELLER" | "TEAM_MEMBER";
export type AdminRole =
  | "SUPER_ADMIN"
  | "SENIOR_ADMIN"
  | "FRAUD_ANALYST"
  | "SUPPORT_AGENT"
  | "FINANCE_ADMIN";
export type AnyRole = BuyerSellerRole | AdminRole;

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export type User = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone: string;
  email?: string;
  role: AnyRole;
  verificationStatus: VerificationStatus;
  trustScore: number;
  languagePref: "en" | "ur";
  createdAt: string;
};

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "SOLD"
  | "FLAGGED"
  | "UNDER_REVIEW"
  | "REMOVED"
  | "EXPIRED"
  | "ARCHIVED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameUr: string;
  verificationSchema: Record<string, "text" | "number" | "image" | "video">;
  escrowEligible: boolean;
};

export type ListingMedia = {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  aiFlags: {
    duplicate?: boolean;
    stockImage?: boolean;
    aiGenerated?: boolean;
    blurry?: boolean;
  };
};

export type Listing = {
  id: string;
  publicId: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  pricePKR: number;
  condition: "NEW" | "USED" | "REFURBISHED";
  status: ListingStatus;
  riskLevel: RiskLevel;
  claimedFields: Record<string, string | boolean>;
  city: string;
  media: ListingMedia[];
  createdAt: string;
  expiresAt?: string;
};

export type FieldVerificationState =
  | "unverified"
  | "pending"
  | "verified_screenshot"
  | "verified_video"
  | "verified";

export type ProductVerification = {
  id: string;
  listingId: string;
  verifiedFields: Record<string, FieldVerificationState>;
  imei?: string;
  serialNumber?: string;
  registrationNumber?: string;
  healthReport: Record<string, "good" | "fair" | "poor" | "not_working">;
  overallHealthScore?: number;
};

export type RiskScoreBreakdown = {
  overall: number;
  identitySignal: number;
  deviceReputationSignal: number;
  listingBehaviorSignal: number;
  priceAnomalySignal: number;
  accountAgeSignal: number;
  userReportSignal: number;
  imageAnalysisSignal: number;
  locationConsistencySignal: number;
  riskLevel: RiskLevel;
};

export type OrderStatus =
  | "PLACED"
  | "PAYMENT_PENDING"
  | "PAYMENT_CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED"
  | "REFUNDED";

export type Order = {
  id: string;
  orderNumber: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  totalAmountPKR: number;
  status: OrderStatus;
  confirmedReceiptAt?: string;
  autoReleaseAt?: string;
  createdAt: string;
};

export type EscrowState = "HELD" | "RELEASED" | "REFUNDED" | "SPLIT";

export type EscrowTransaction = {
  id: string;
  orderId: string;
  heldAmountPKR: number;
  feeAmountPKR: number;
  state: EscrowState;
  heldForReview: boolean;
  releasedAt?: string;
};

export type PaymentProvider = "JAZZCASH" | "EASYPAISA" | "RAAST" | "CARD";
export type PaymentTxnStatus = "PENDING" | "SUCCESS" | "FAILED" | "TIMEOUT";
export type PayoutStatus = "PENDING" | "ON_HOLD" | "PROCESSED" | "FAILED";

export type Payout = {
  id: string;
  sellerId: string;
  escrowTransactionId: string;
  payoutMethod: "JAZZCASH" | "EASYPAISA" | "BANK";
  amountPKR: number;
  status: PayoutStatus;
  heldReason?: string;
  createdAt: string;
};

export type ScamPatternType =
  | "ADVANCE_PAYMENT"
  | "OTP_REQUEST"
  | "PHISHING_LINK"
  | "FAKE_COURIER";

export type ChatMessage = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  scamFlag: boolean;
  scamPatternType?: ScamPatternType;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  listingId: string;
  listingTitle: string;
  counterpartName: string;
  lastMessage: string;
  unread: number;
  hasScamFlag: boolean;
};

export type DisputeStatus =
  | "OPENED"
  | "EVIDENCE_COLLECTION"
  | "UNDER_REVIEW"
  | "ESCALATED"
  | "RESOLVED";
export type DisputeDecision = "RELEASE_SELLER" | "REFUND_BUYER" | "SPLIT";

export type DisputeEvidence = {
  id: string;
  submittedBy: string;
  evidenceType: "PHOTO" | "VIDEO" | "RECEIPT" | "CHAT_SCREENSHOT";
  url: string;
  label?: string;
  /** Set when the evidence was pulled from a monitored chat thread. */
  sourceThreadId?: string;
  sourceMessageId?: string;
  submittedAt?: string;
};

export type Dispute = {
  id: string;
  orderId: string;
  orderNumber: string;
  openedBy: string;
  status: DisputeStatus;
  amountPKR: number;
  decision?: DisputeDecision;
  decidedBy?: string;
  escalatedToAdminId?: string;
  evidence: DisputeEvidence[];
  createdAt: string;
  /** Demo-accelerated 72h evidence window. */
  evidenceWindowClosesAt?: string;
};

export type ScamReportStatus = "PENDING" | "VERIFIED" | "DISMISSED";

export type DigitalCertificate = {
  id: string;
  publicId: string;
  certificateNumber: string;
  orderId: string;
  itemTitle: string;
  amountPKR: number;
  pdfUrl: string;
  qrUrl: string;
  issuedAt: string;
};

export type OwnershipHistoryEntry = {
  ownerSequence: number;
  orderId: string;
  date: string;
};

export type BusinessStore = {
  id: string;
  sellerId: string;
  storeName: string;
  logoUrl?: string;
  verifiedSeller: boolean;
  activeListingCount: number;
  totalSales: number;
  teamMembers: string[];
};

export type FraudQueueItem = {
  id: string;
  subjectType: "LISTING" | "ACCOUNT";
  subjectId: string;
  subjectTitle: string;
  city: string;
  risk: RiskScoreBreakdown | null;
  status: "NEW" | "IN_REVIEW" | "ESCALATED" | "CLEARED" | "REJECTED";
  createdAt: string;
};

export type ApiSuccess<T> = {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    filters?: Record<string, unknown>;
  };
  requestId?: string;
};

export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};