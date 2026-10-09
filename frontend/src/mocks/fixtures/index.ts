import bike from "@/assets/listing-bike.jpg";
import car from "@/assets/listing-car.jpg";
import laptop from "@/assets/listing-laptop.jpg";
import phone from "@/assets/listing-phone.jpg";
import type {
  Category,
  ChatMessage,
  ChatThread,
  DigitalCertificate,
  Dispute,
  EscrowTransaction,
  FraudQueueItem,
  Listing,
  Order,
  Payout,
  ProductVerification,
  RiskScoreBreakdown,
  User,
} from "@/types";

export const currentBuyer: User = {
  id: "u_buyer_1",
  fullName: "Ayesha Khan",
  phone: "+92 300 1234567",
  email: "ayesha@example.com",
  role: "BUYER",
  verificationStatus: "VERIFIED",
  trustScore: 82,
  languagePref: "en",
  createdAt: "2025-03-14T09:00:00Z",
};

export const currentSeller: User = {
  id: "u_seller_1",
  fullName: "Bilal Traders",
  phone: "+92 321 7654321",
  role: "BUSINESS_SELLER",
  verificationStatus: "VERIFIED",
  trustScore: 91,
  languagePref: "en",
  createdAt: "2024-11-02T09:00:00Z",
};

export const currentAdmin: User = {
  id: "u_admin_1",
  fullName: "Hamza Raza",
  phone: "+92 333 9990000",
  role: "SENIOR_ADMIN",
  verificationStatus: "VERIFIED",
  trustScore: 100,
  languagePref: "en",
  createdAt: "2024-06-02T09:00:00Z",
};

export const categories: Category[] = [
  {
    id: "cat_mobiles",
    slug: "mobiles",
    nameEn: "Mobile Phones",
    nameUr: "موبائل فون",
    verificationSchema: { imei: "text", boxPhoto: "image", powerOnVideo: "video" },
    escrowEligible: true,
  },
  {
    id: "cat_cars",
    slug: "cars",
    nameEn: "Cars",
    nameUr: "گاڑیاں",
    verificationSchema: { registrationNumber: "text", chassisPhoto: "image" },
    escrowEligible: true,
  },
  {
    id: "cat_laptops",
    slug: "laptops",
    nameEn: "Laptops",
    nameUr: "لیپ ٹاپ",
    verificationSchema: { serialNumber: "text", specsScreenshot: "image" },
    escrowEligible: true,
  },
  {
    id: "cat_bikes",
    slug: "bikes",
    nameEn: "Bikes",
    nameUr: "موٹر سائیکل",
    verificationSchema: { registrationNumber: "text", engineNumber: "text" },
    escrowEligible: true,
  },
];

export const sellers: User[] = [
  currentSeller,
  {
    id: "u_seller_2",
    fullName: "Karachi Mobile Hub",
    phone: "+92 345 1112223",
    role: "SELLER",
    verificationStatus: "VERIFIED",
    trustScore: 74,
    languagePref: "ur",
    createdAt: "2025-01-20T09:00:00Z",
  },
  {
    id: "u_seller_3",
    fullName: "Usman Auto",
    phone: "+92 302 4445556",
    role: "SELLER",
    verificationStatus: "PENDING",
    trustScore: 41,
    languagePref: "en",
    createdAt: "2026-07-28T09:00:00Z",
  },
];

export const listings: Listing[] = [
  {
    id: "l_1",
    publicId: "TM-PH-88213",
    sellerId: "u_seller_1",
    categoryId: "cat_mobiles",
    title: "iPhone 14 Pro 256GB — PTA Approved",
    description:
      "Single owner, box and original charger included. IMEI submitted for platform verification. Battery health 91%.",
    pricePKR: 289000,
    condition: "USED",
    status: "PUBLISHED",
    riskLevel: "LOW",
    claimedFields: { imei: "35••••••••••219", boxIncluded: true, batteryHealth: "91%" },
    city: "Lahore",
    media: [{ id: "m1", mediaType: "IMAGE", url: phone, aiFlags: {} }],
    createdAt: "2026-08-04T10:00:00Z",
  },
  {
    id: "l_2",
    publicId: "TM-CR-40912",
    sellerId: "u_seller_3",
    categoryId: "cat_cars",
    title: "Toyota Corolla Altis 1.6 — 2019",
    description:
      "Registered Lahore, 74,000 km. Registration number submitted; awaiting platform verification against records.",
    pricePKR: 6450000,
    condition: "USED",
    status: "UNDER_REVIEW",
    riskLevel: "HIGH",
    claimedFields: { registrationNumber: "LEB-19-••••", mileage: "74,000 km" },
    city: "Lahore",
    media: [{ id: "m2", mediaType: "IMAGE", url: car, aiFlags: { duplicate: true } }],
    createdAt: "2026-08-07T08:20:00Z",
  },
  {
    id: "l_3",
    publicId: "TM-LT-11238",
    sellerId: "u_seller_2",
    categoryId: "cat_laptops",
    title: "MacBook Air M2 8/256 — Warranty Left",
    description: "Serial verified by platform. 42 charge cycles, no dents, AppleCare until Feb 2027.",
    pricePKR: 231000,
    condition: "REFURBISHED",
    status: "PUBLISHED",
    riskLevel: "LOW",
    claimedFields: { serialNumber: "C02••••••XZ", cycles: "42" },
    city: "Karachi",
    media: [{ id: "m3", mediaType: "IMAGE", url: laptop, aiFlags: {} }],
    createdAt: "2026-08-02T12:00:00Z",
  },
  {
    id: "l_4",
    publicId: "TM-BK-77341",
    sellerId: "u_seller_2",
    categoryId: "cat_bikes",
    title: "Honda CG 125 — 2022 Model",
    description: "Registration in seller's own name. Engine and chassis photos uploaded for verification.",
    pricePKR: 214000,
    condition: "USED",
    status: "PUBLISHED",
    riskLevel: "MEDIUM",
    claimedFields: { registrationNumber: "KHI-22-••••", engineNumber: "JC••••41" },
    city: "Karachi",
    media: [{ id: "m4", mediaType: "IMAGE", url: bike, aiFlags: { blurry: true } }],
    createdAt: "2026-08-06T15:30:00Z",
  },
];

export const productVerifications: Record<string, ProductVerification> = {
  l_1: {
    id: "pv_1",
    listingId: "l_1",
    verifiedFields: {
      imei: "verified",
      boxPhoto: "verified_screenshot",
      powerOnVideo: "verified_video",
      batteryHealth: "unverified",
    },
    imei: "35••••••••••219",
    healthReport: {
      screen: "good",
      battery: "fair",
      camera: "good",
      speakers: "good",
      chargingPort: "good",
      faceId: "good",
    },
    overallHealthScore: 88,
  },
  l_2: {
    id: "pv_2",
    listingId: "l_2",
    verifiedFields: { registrationNumber: "pending", chassisPhoto: "unverified" },
    registrationNumber: "LEB-19-••••",
    healthReport: { engine: "good", bodywork: "fair", tyres: "poor", ac: "good" },
    overallHealthScore: 64,
  },
  l_3: {
    id: "pv_3",
    listingId: "l_3",
    verifiedFields: { serialNumber: "verified", specsScreenshot: "verified_screenshot" },
    serialNumber: "C02••••••XZ",
    healthReport: { display: "good", battery: "good", keyboard: "good", ports: "good" },
    overallHealthScore: 94,
  },
  l_4: {
    id: "pv_4",
    listingId: "l_4",
    verifiedFields: { registrationNumber: "verified_screenshot", engineNumber: "pending" },
    registrationNumber: "KHI-22-••••",
    healthReport: { engine: "good", tyres: "fair", brakes: "fair", lights: "good" },
    overallHealthScore: 76,
  },
};

/** Fixed demo breakdowns — never a computed or "real" fraud score. */
export const riskBreakdowns = {
  l_1: {
    overall: 14,
    identitySignal: 5,
    deviceReputationSignal: 10,
    listingBehaviorSignal: 12,
    priceAnomalySignal: 18,
    accountAgeSignal: 8,
    userReportSignal: 0,
    imageAnalysisSignal: 11,
    locationConsistencySignal: 6,
    riskLevel: "LOW",
  },
  l_2: {
    overall: 82,
    identitySignal: 71,
    deviceReputationSignal: 64,
    listingBehaviorSignal: 88,
    priceAnomalySignal: 93,
    accountAgeSignal: 90,
    userReportSignal: 55,
    imageAnalysisSignal: 87,
    locationConsistencySignal: 60,
    riskLevel: "HIGH",
  },
  l_3: {
    overall: 11,
    identitySignal: 4,
    deviceReputationSignal: 9,
    listingBehaviorSignal: 8,
    priceAnomalySignal: 15,
    accountAgeSignal: 12,
    userReportSignal: 0,
    imageAnalysisSignal: 10,
    locationConsistencySignal: 5,
    riskLevel: "LOW",
  },
  l_4: {
    overall: 48,
    identitySignal: 22,
    deviceReputationSignal: 35,
    listingBehaviorSignal: 51,
    priceAnomalySignal: 44,
    accountAgeSignal: 30,
    userReportSignal: 25,
    imageAnalysisSignal: 68,
    locationConsistencySignal: 40,
    riskLevel: "MEDIUM",
  },
} satisfies Record<string, RiskScoreBreakdown>;

export const orders: Order[] = [
  {
    id: "o_1",
    orderNumber: "TM-ORD-100482",
    listingId: "l_1",
    listingTitle: "iPhone 14 Pro 256GB — PTA Approved",
    buyerId: "u_buyer_1",
    sellerId: "u_seller_1",
    sellerName: "Bilal Traders",
    totalAmountPKR: 292890,
    status: "PAYMENT_CONFIRMED",
    createdAt: "2026-08-11T12:00:00Z",
  },
  {
    id: "o_2",
    orderNumber: "TM-ORD-100455",
    listingId: "l_3",
    listingTitle: "MacBook Air M2 8/256 — Warranty Left",
    buyerId: "u_buyer_1",
    sellerId: "u_seller_2",
    sellerName: "Karachi Mobile Hub",
    totalAmountPKR: 233310,
    status: "SHIPPED",
    autoReleaseAt: "2026-08-18T12:00:00Z",
    createdAt: "2026-08-08T10:00:00Z",
  },
  {
    id: "o_3",
    orderNumber: "TM-ORD-100496",
    listingId: "l_6",
    listingTitle: "Dell XPS 13 i7 — Fully Platform Verified",
    buyerId: "u_buyer_1",
    sellerId: "u_seller_1",
    sellerName: "Bilal Traders",
    totalAmountPKR: 201470,
    status: "DELIVERED",
    autoReleaseAt: "2026-08-15T09:00:00Z",
    createdAt: "2026-08-06T09:00:00Z",
  },
  {
    id: "o_4",
    orderNumber: "TM-ORD-100433",
    listingId: "l_7",
    listingTitle: "Yamaha YBR 125G — 2023",
    buyerId: "u_buyer_1",
    sellerId: "u_seller_1",
    sellerName: "Bilal Traders",
    totalAmountPKR: 334435,
    status: "DELIVERED",
    autoReleaseAt: "2026-08-05T09:00:00Z",
    createdAt: "2026-07-27T09:00:00Z",
  },
  {
    id: "o_5",
    orderNumber: "TM-ORD-100501",
    listingId: "l_4",
    listingTitle: "Honda CG 125 — 2022 Model",
    buyerId: "u_buyer_1",
    sellerId: "u_seller_2",
    sellerName: "Karachi Mobile Hub",
    totalAmountPKR: 216140,
    status: "DISPUTED",
    createdAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "o_6",
    orderNumber: "TM-ORD-100512",
    listingId: "l_2",
    listingTitle: "Toyota Corolla Altis 1.6 — 2019",
    buyerId: "u_buyer_1",
    sellerId: "u_seller_3",
    sellerName: "Usman Auto",
    totalAmountPKR: 6482250,
    status: "CANCELLED",
    createdAt: "2026-08-09T18:40:00Z",
  },
  {
    id: "o_7",
    orderNumber: "TM-ORD-100519",
    listingId: "l_8",
    listingTitle: "Suzuki Cultus VXL — 2020",
    buyerId: "u_buyer_1",
    sellerId: "u_seller_3",
    sellerName: "Usman Auto",
    totalAmountPKR: 4040200,
    status: "DELIVERED",
    autoReleaseAt: "2026-08-17T09:00:00Z",
    createdAt: "2026-08-07T09:00:00Z",
  },
  {
    id: "o_8",
    orderNumber: "TM-ORD-100388",
    listingId: "l_5",
    listingTitle: "Samsung Galaxy S23 128GB — Claimed Only",
    buyerId: "u_buyer_2",
    sellerId: "u_seller_2",
    sellerName: "Karachi Mobile Hub",
    totalAmountPKR: 177118,
    status: "DISPUTED",
    createdAt: "2026-07-22T09:00:00Z",
  },
];

/** Orders that belong to the signed-in demo buyer. */
export const buyerOrders = () => orders.filter((o) => o.buyerId === currentBuyer.id);

/** Delivered orders past their auto-release window read as auto-released. */
export const isAutoReleased = (order: Order) =>
  order.status === "DELIVERED" &&
  !!order.autoReleaseAt &&
  new Date(order.autoReleaseAt).getTime() < Date.now();

export const escrowTransactions: Record<string, EscrowTransaction> = {
  o_1: {
    id: "esc_1",
    orderId: "o_1",
    heldAmountPKR: 289000,
    feeAmountPKR: 3890,
    state: "HELD",
    heldForReview: false,
  },
  o_2: {
    id: "esc_2",
    orderId: "o_2",
    heldAmountPKR: 231000,
    feeAmountPKR: 2310,
    state: "HELD",
    heldForReview: false,
  },
  o_3: {
    id: "esc_3",
    orderId: "o_3",
    heldAmountPKR: 198000,
    feeAmountPKR: 2970,
    state: "HELD",
    heldForReview: false,
  },
  o_4: {
    id: "esc_4",
    orderId: "o_4",
    heldAmountPKR: 329000,
    feeAmountPKR: 4935,
    state: "RELEASED",
    heldForReview: false,
    releasedAt: "2026-08-05T09:05:00Z",
  },
  o_5: {
    id: "esc_5",
    orderId: "o_5",
    heldAmountPKR: 214000,
    feeAmountPKR: 2140,
    state: "HELD",
    heldForReview: true,
  },
  o_6: {
    id: "esc_6",
    orderId: "o_6",
    heldAmountPKR: 6450000,
    feeAmountPKR: 0,
    state: "REFUNDED",
    heldForReview: false,
  },
  o_7: {
    id: "esc_7",
    orderId: "o_7",
    heldAmountPKR: 3980000,
    feeAmountPKR: 59700,
    state: "HELD",
    heldForReview: true,
  },
  o_8: {
    id: "esc_8",
    orderId: "o_8",
    heldAmountPKR: 174500,
    feeAmountPKR: 2618,
    state: "HELD",
    heldForReview: true,
  },
};

/** Escrow release can be blocked when the seller account is under fraud review. */
export const escrowReleaseBlock: Record<string, { sellerName: string; reason: string }> = {
  o_7: {
    sellerName: "Usman Auto",
    reason:
      "This seller's account is being reviewed by our fraud team, so release is paused. Your money stays safely in escrow — nothing is lost and you do not need to do anything. If the review clears, payment releases automatically; if it does not, you are refunded in full.",
  },
};

export const payouts: Payout[] = [
  {
    id: "p_1",
    sellerId: "u_seller_1",
    escrowTransactionId: "esc_2",
    payoutMethod: "EASYPAISA",
    amountPKR: 228690,
    status: "PROCESSED",
    createdAt: "2026-07-31T09:00:00Z",
  },
  {
    id: "p_2",
    sellerId: "u_seller_1",
    escrowTransactionId: "esc_2",
    payoutMethod: "BANK",
    amountPKR: 285110,
    status: "PENDING",
    createdAt: "2026-08-09T09:00:00Z",
  },
  {
    id: "p_3",
    sellerId: "u_seller_1",
    escrowTransactionId: "esc_5",
    payoutMethod: "JAZZCASH",
    amountPKR: 211860,
    status: "ON_HOLD",
    heldReason: "Order under dispute review — payout blocked until decision.",
    createdAt: "2026-08-05T09:00:00Z",
  },
];

export const chatThreads: ChatThread[] = [
  {
    id: "t_1",
    listingId: "l_1",
    listingTitle: "iPhone 14 Pro 256GB",
    counterpartName: "Bilal Traders",
    lastMessage: "Escrow payment is the safest way — I've enabled it on the listing.",
    unread: 0,
    hasScamFlag: false,
  },
  {
    id: "t_2",
    listingId: "l_2",
    listingTitle: "Toyota Corolla Altis 1.6",
    counterpartName: "Usman Auto",
    lastMessage: "Send 20,000 advance on this Easypaisa number to hold the car.",
    unread: 2,
    hasScamFlag: true,
  },
  {
    id: "t_3",
    listingId: "l_4",
    listingTitle: "Honda CG 125 — 2022 Model",
    counterpartName: "Karachi Mobile Hub",
    lastMessage: "Pay the courier 3,500 delivery fee directly when he calls you.",
    unread: 1,
    hasScamFlag: true,
  },
];

/** Chat threads are linked to live orders so evidence can be traced across screens. */
export const threadOrderLinks: Record<string, string> = {
  t_1: "o_1",
  t_3: "o_5",
};

export const chatMessages: Record<string, ChatMessage[]> = {
  t_1: [
    {
      id: "cm_1",
      threadId: "t_1",
      senderId: "u_buyer_1",
      body: "Is the box and original charger included?",
      scamFlag: false,
      createdAt: "2026-08-09T09:02:00Z",
    },
    {
      id: "cm_2",
      threadId: "t_1",
      senderId: "u_seller_1",
      body: "Yes, both included. IMEI is platform verified on the listing.",
      scamFlag: false,
      createdAt: "2026-08-09T09:04:00Z",
    },
    {
      id: "cm_3",
      threadId: "t_1",
      senderId: "u_seller_1",
      body: "Escrow payment is the safest way — I've enabled it on the listing.",
      scamFlag: false,
      createdAt: "2026-08-09T09:05:00Z",
    },
  ],
  t_2: [
    {
      id: "cm_4",
      threadId: "t_2",
      senderId: "u_buyer_1",
      body: "Can I inspect the car this weekend?",
      scamFlag: false,
      createdAt: "2026-08-09T14:00:00Z",
    },
    {
      id: "cm_5",
      threadId: "t_2",
      senderId: "u_seller_3",
      body: "Send 20,000 advance on this Easypaisa number to hold the car.",
      scamFlag: true,
      scamPatternType: "ADVANCE_PAYMENT",
      createdAt: "2026-08-09T14:03:00Z",
    },
    {
      id: "cm_6",
      threadId: "t_2",
      senderId: "u_seller_3",
      body: "Also share the OTP you receive so I can confirm the booking.",
      scamFlag: true,
      scamPatternType: "OTP_REQUEST",
      createdAt: "2026-08-09T14:05:00Z",
    },
  ],
  t_3: [
    {
      id: "cm_31",
      threadId: "t_3",
      senderId: "u_buyer_1",
      body: "Order TM-ORD-100501 is paid into escrow. When is the bike being dispatched?",
      scamFlag: false,
      createdAt: "2026-08-02T10:00:00Z",
    },
    {
      id: "cm_32",
      threadId: "t_3",
      senderId: "u_seller_2",
      body: "Dispatching tomorrow, our own rider will bring it.",
      scamFlag: false,
      createdAt: "2026-08-02T10:06:00Z",
    },
    {
      id: "cm_33",
      threadId: "t_3",
      senderId: "u_seller_2",
      body: "Pay the courier 3,500 delivery fee directly when he calls you.",
      scamFlag: true,
      scamPatternType: "FAKE_COURIER",
      createdAt: "2026-08-03T11:20:00Z",
    },
  ],
};

export const disputes: Dispute[] = [
  {
    id: "d_1",
    orderId: "o_5",
    orderNumber: "TM-ORD-100501",
    openedBy: "u_buyer_1",
    status: "EVIDENCE_COLLECTION",
    amountPKR: 216140,
    evidenceWindowClosesAt: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
    evidence: [
      {
        id: "ev_1",
        submittedBy: "u_buyer_1",
        evidenceType: "PHOTO",
        url: "#",
        label: "Photo of the delivered bike — engine number does not match the listing",
        submittedAt: "2026-08-04T09:05:00Z",
      },
      {
        id: "ev_2",
        submittedBy: "u_buyer_1",
        evidenceType: "CHAT_SCREENSHOT",
        url: "#",
        label: "Chat screenshot: seller asked for a 3,500 courier fee outside TrustMart",
        sourceThreadId: "t_3",
        sourceMessageId: "cm_33",
        submittedAt: "2026-08-04T09:07:00Z",
      },
      {
        id: "ev_3",
        submittedBy: "u_seller_2",
        evidenceType: "RECEIPT",
        url: "#",
        label: "Seller dispatch receipt",
        submittedAt: "2026-08-04T15:00:00Z",
      },
    ],
    createdAt: "2026-08-04T09:00:00Z",
  },
  {
    id: "d_2",
    orderId: "o_8",
    orderNumber: "TM-ORD-100388",
    openedBy: "u_buyer_2",
    status: "ESCALATED",
    amountPKR: 177118,
    evidence: [
      {
        id: "ev_4",
        submittedBy: "u_buyer_2",
        evidenceType: "VIDEO",
        url: "#",
        label: "Unboxing video showing a different model",
      },
    ],
    createdAt: "2026-07-24T09:00:00Z",
  },
];

export const disputeForOrder = (orderId: string) =>
  disputes.find((d) => d.orderId === orderId) ?? null;

export const certificates: DigitalCertificate[] = [
  {
    id: "c_1",
    publicId: "cert-9f31a",
    certificateNumber: "TM-CERT-2026-004821",
    orderId: "o_4",
    itemTitle: "Yamaha YBR 125G — 2023",
    amountPKR: 329000,
    pdfUrl: "#",
    qrUrl: "#",
    issuedAt: "2026-08-05T12:00:00Z",
  },
];

export const fraudQueue: FraudQueueItem[] = [
  {
    id: "fq_1",
    subjectType: "LISTING",
    subjectId: "l_2",
    subjectTitle: "Toyota Corolla Altis 1.6 — 2019",
    city: "Lahore",
    risk: riskBreakdowns.l_2,
    status: "NEW",
    createdAt: "2026-08-07T08:30:00Z",
  },
  {
    id: "fq_2",
    subjectType: "LISTING",
    subjectId: "l_4",
    subjectTitle: "Honda CG 125 — 2022 Model",
    city: "Karachi",
    risk: riskBreakdowns.l_4,
    status: "IN_REVIEW",
    createdAt: "2026-08-06T16:00:00Z",
  },
  {
    id: "fq_3",
    subjectType: "ACCOUNT",
    subjectId: "u_seller_3",
    subjectTitle: "Usman Auto (account)",
    city: "Lahore",
    risk: null,
    status: "NEW",
    createdAt: "2026-08-09T07:15:00Z",
  },
];

export const revenueSeries = [
  { month: "Feb", escrowFees: 1.2, boosts: 0.4, refunds: 0.1 },
  { month: "Mar", escrowFees: 1.6, boosts: 0.5, refunds: 0.14 },
  { month: "Apr", escrowFees: 2.1, boosts: 0.6, refunds: 0.12 },
  { month: "May", escrowFees: 2.4, boosts: 0.72, refunds: 0.19 },
  { month: "Jun", escrowFees: 3.0, boosts: 0.81, refunds: 0.16 },
  { month: "Jul", escrowFees: 3.6, boosts: 0.95, refunds: 0.22 },
];

export const trustScoreTrend = [
  { week: "W1", score: 72 },
  { week: "W2", score: 76 },
  { week: "W3", score: 79 },
  { week: "W4", score: 84 },
  { week: "W5", score: 88 },
  { week: "W6", score: 91 },
];
export const riskFor = (listingId: string): RiskScoreBreakdown | null =>
  (riskBreakdowns as Record<string, RiskScoreBreakdown>)[listingId] ?? null;

// ── Additional demo spread (PW-02/03/04/05/07/15) ──────────────────────────
export const extraListings: Listing[] = [
  {
    id: "l_5",
    publicId: "TM-PH-55021",
    sellerId: "u_seller_2",
    categoryId: "cat_mobiles",
    title: "Samsung Galaxy S23 128GB — Claimed Only",
    description:
      "Seller has stated all details. No platform verification submitted yet, so every field below is a seller claim.",
    pricePKR: 174500,
    condition: "USED",
    status: "PUBLISHED",
    riskLevel: "MEDIUM",
    claimedFields: { imei: "35••••••••••701", boxIncluded: false, batteryHealth: "88%" },
    city: "Islamabad",
    media: [{ id: "m5", mediaType: "IMAGE", url: phone, aiFlags: {} }],
    createdAt: "2026-08-05T09:10:00Z",
  },
  {
    id: "l_6",
    publicId: "TM-LT-66120",
    sellerId: "u_seller_1",
    categoryId: "cat_laptops",
    title: "Dell XPS 13 i7 — Fully Platform Verified",
    description:
      "Serial number and specs screenshot verified by TrustMart. Seller added no unverified claims.",
    pricePKR: 198000,
    condition: "REFURBISHED",
    status: "PUBLISHED",
    riskLevel: "LOW",
    claimedFields: {},
    city: "Lahore",
    media: [{ id: "m6", mediaType: "IMAGE", url: laptop, aiFlags: {} }],
    createdAt: "2026-08-03T09:10:00Z",
  },
  {
    id: "l_7",
    publicId: "TM-BK-90233",
    sellerId: "u_seller_1",
    categoryId: "cat_bikes",
    title: "Yamaha YBR 125G — 2023",
    description: "Registration verified. Low mileage, single owner, all documents in seller's name.",
    pricePKR: 329000,
    condition: "USED",
    status: "PUBLISHED",
    riskLevel: "LOW",
    claimedFields: { mileage: "9,400 km" },
    city: "Faisalabad",
    media: [{ id: "m7", mediaType: "IMAGE", url: bike, aiFlags: {} }],
    createdAt: "2026-08-01T09:10:00Z",
  },
  {
    id: "l_8",
    publicId: "TM-CR-31877",
    sellerId: "u_seller_2",
    categoryId: "cat_cars",
    title: "Suzuki Cultus VXL — 2020",
    description: "Registration verified against records. Mileage is a seller claim pending inspection.",
    pricePKR: 3980000,
    condition: "USED",
    status: "PUBLISHED",
    riskLevel: "MEDIUM",
    claimedFields: { mileage: "48,000 km", accidentFree: true },
    city: "Karachi",
    media: [{ id: "m8", mediaType: "IMAGE", url: car, aiFlags: {} }],
    createdAt: "2026-07-29T09:10:00Z",
  },
];

listings.push(...extraListings);

/** l_5 = claimed only, l_6 = verified only, l_8 = verified with a discrepancy. */
Object.assign(productVerifications, {
  l_5: {
    id: "pv_5",
    listingId: "l_5",
    verifiedFields: {},
    healthReport: {},
    // no overall score — Health Report must handle partially-empty data
  } satisfies ProductVerification,
  l_6: {
    id: "pv_6",
    listingId: "l_6",
    verifiedFields: { serialNumber: "verified", specsScreenshot: "verified_screenshot" },
    serialNumber: "8F••••••Q2",
    healthReport: { display: "good", battery: "good", keyboard: "good", ports: "good" },
    overallHealthScore: 92,
  } satisfies ProductVerification,
  l_7: {
    id: "pv_7",
    listingId: "l_7",
    verifiedFields: { registrationNumber: "verified", engineNumber: "verified_screenshot" },
    registrationNumber: "FSD-23-••••",
    healthReport: { engine: "good", tyres: "good", brakes: "good", lights: "fair" },
    overallHealthScore: 89,
  } satisfies ProductVerification,
  l_8: {
    id: "pv_8",
    listingId: "l_8",
    verifiedFields: { registrationNumber: "verified", chassisPhoto: "verified_screenshot" },
    registrationNumber: "AKK-20-••••",
    healthReport: { engine: "good", bodywork: "fair", tyres: "fair", ac: "poor" },
    overallHealthScore: 71,
  } satisfies ProductVerification,
});

/** Fields where the seller claim disagrees with what the platform verified. */
export const verificationDiscrepancies: Record<string, Array<{ field: string; claimed: string; verified: string }>> = {
  l_8: [
    { field: "mileage", claimed: "48,000 km", verified: "63,100 km on last inspection record" },
    { field: "accidentFree", claimed: "Yes", verified: "One recorded body repair claim (2022)" },
  ],
};

Object.assign(riskBreakdowns, {
  l_5: {
    overall: 44,
    identitySignal: 30,
    deviceReputationSignal: 28,
    listingBehaviorSignal: 47,
    priceAnomalySignal: 52,
    accountAgeSignal: 26,
    userReportSignal: 12,
    imageAnalysisSignal: 58,
    locationConsistencySignal: 33,
    riskLevel: "MEDIUM",
  },
  l_6: {
    overall: 9,
    identitySignal: 3,
    deviceReputationSignal: 7,
    listingBehaviorSignal: 6,
    priceAnomalySignal: 12,
    accountAgeSignal: 5,
    userReportSignal: 0,
    imageAnalysisSignal: 8,
    locationConsistencySignal: 4,
    riskLevel: "LOW",
  },
  l_7: {
    overall: 17,
    identitySignal: 6,
    deviceReputationSignal: 12,
    listingBehaviorSignal: 14,
    priceAnomalySignal: 22,
    accountAgeSignal: 9,
    userReportSignal: 4,
    imageAnalysisSignal: 19,
    locationConsistencySignal: 11,
    riskLevel: "LOW",
  },
  l_8: {
    overall: 57,
    identitySignal: 21,
    deviceReputationSignal: 39,
    listingBehaviorSignal: 44,
    priceAnomalySignal: 71,
    accountAgeSignal: 18,
    userReportSignal: 33,
    imageAnalysisSignal: 49,
    locationConsistencySignal: 62,
    riskLevel: "MEDIUM",
  },
});

export type Review = {
  id: string;
  sellerId: string;
  orderId: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
};

export const reviews: Review[] = [
  {
    id: "rv_1",
    sellerId: "u_seller_1",
    orderId: "o_1",
    authorName: "Ayesha K.",
    rating: 5,
    body: "IMEI matched exactly what the listing said. Escrow released after I confirmed receipt.",
    verifiedPurchase: true,
    createdAt: "2026-08-09T09:00:00Z",
  },
  {
    id: "rv_2",
    sellerId: "u_seller_2",
    orderId: "o_2",
    authorName: "Hassan R.",
    rating: 4,
    body: "Laptop as described, packaging could be better. Certificate issued next day.",
    verifiedPurchase: true,
    createdAt: "2026-07-31T09:00:00Z",
  },
  {
    id: "rv_3",
    sellerId: "u_seller_2",
    orderId: "o_3",
    authorName: "Nida S.",
    rating: 2,
    body: "Bike condition did not match the health report. Dispute is under review.",
    verifiedPurchase: true,
    createdAt: "2026-08-04T09:00:00Z",
  },
  {
    id: "rv_4",
    sellerId: "u_seller_1",
    orderId: "o_2",
    authorName: "Faisal A.",
    rating: 5,
    body: "Verified seller, quick shipping, no advance payment requested at any point.",
    verifiedPurchase: true,
    createdAt: "2026-07-20T09:00:00Z",
  },
];

export type Notification = {
  id: string;
  kind: "ESCROW" | "VERIFICATION" | "SCAM" | "DISPUTE" | "CERTIFICATE";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export const notifications: Notification[] = [
  {
    id: "n_1",
    kind: "SCAM",
    title: "Scam pattern detected",
    body: "A message in your chat with Usman Auto asked for an advance payment and an OTP.",
    read: false,
    createdAt: "2026-08-09T14:06:00Z",
  },
  {
    id: "n_2",
    kind: "ESCROW",
    title: "Escrow holding your payment",
    body: "Order TM-ORD-100482 shipped. Funds stay in escrow until you confirm receipt.",
    read: false,
    createdAt: "2026-08-08T13:00:00Z",
  },
  {
    id: "n_3",
    kind: "CERTIFICATE",
    title: "Digital certificate issued",
    body: "Certificate TM-CERT-2026-004821 is ready for Yamaha YBR 125G — 2023.",
    read: true,
    createdAt: "2026-08-05T12:05:00Z",
  },
  {
    id: "n_4",
    kind: "DISPUTE",
    title: "Dispute under review",
    body: "Order TM-ORD-100501 is with the TrustMart dispute team. Escrow release is blocked.",
    read: true,
    createdAt: "2026-08-04T10:00:00Z",
  },
];

export const savedListingIds = ["l_1", "l_6", "l_8"];

export const scamReportReasons = [
  { value: "ADVANCE_PAYMENT", label: "Asked for payment outside TrustMart" },
  { value: "OTP_REQUEST", label: "Asked for an OTP or verification code" },
  { value: "PHISHING_LINK", label: "Sent a suspicious payment link" },
  { value: "FAKE_COURIER", label: "Fake courier or delivery fee" },
  { value: "FAKE_LISTING", label: "Listing details are fake or stolen" },
  { value: "ITEM_NOT_AS_DESCRIBED", label: "Item not as described" },
] as const;

export type ScamReport = {
  id: string;
  subject: string;
  reason: string;
  details: string;
  evidenceCount: number;
  createdAt: string;
};

/** In-memory demo store so the 24h duplicate-report block can be shown. */
export const scamReports: ScamReport[] = [
  {
    id: "sr_1",
    subject: "t_2 — Usman Auto (Toyota Corolla Altis 1.6)",
    reason: "ADVANCE_PAYMENT",
    details: "Seller asked for a 20,000 advance on Easypaisa and then requested my OTP.",
    evidenceCount: 2,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export const scamReportSubjects = [
  { value: "t_2 — Usman Auto (Toyota Corolla Altis 1.6)", label: "Chat with Usman Auto — Toyota Corolla Altis 1.6" },
  { value: "t_3 — Karachi Mobile Hub (Honda CG 125)", label: "Chat with Karachi Mobile Hub — Honda CG 125" },
  { value: "l_5 — Samsung Galaxy S23 128GB", label: "Listing — Samsung Galaxy S23 128GB" },
  { value: "u_seller_3 — Usman Auto", label: "Seller account — Usman Auto" },
];

/** Escrow quote is calculated, never hardcoded per screen. */
export const escrowQuote = (pricePKR: number) => {
  const escrowFee = Math.round(pricePKR * 0.01);
  const processingFee = Math.round(pricePKR * 0.005);
  const verificationFee = 500;
  return {
    pricePKR,
    escrowFee,
    processingFee,
    verificationFee,
    totalPKR: pricePKR + escrowFee + processingFee + verificationFee,
  };
};

export const buyerTrustScore = {
  score: currentBuyer.trustScore,
  factors: [
    { label: "Identity verified", value: "Yes", weight: "+25" },
    { label: "Completed escrow orders", value: "3", weight: "+18" },
    { label: "Receipt confirmed on time", value: "3 of 3", weight: "+12" },
    { label: "Disputes opened vs orders", value: "1 of 4", weight: "-8" },
    { label: "Account age", value: "17 months", weight: "+10" },
  ],
};
