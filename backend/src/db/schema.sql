-- TrustMart backend schema (SQLite for local/dev; Postgres-portable design)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  avatarUrl TEXT,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL,
  verificationStatus TEXT NOT NULL DEFAULT 'UNVERIFIED',
  trustScore INTEGER NOT NULL DEFAULT 50,
  languagePref TEXT NOT NULL DEFAULT 'en',
  passwordHash TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  userId TEXT,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  consumedAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  tokenHash TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  revokedAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nameEn TEXT NOT NULL,
  nameUr TEXT NOT NULL,
  verificationSchema TEXT NOT NULL,
  escrowEligible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  publicId TEXT UNIQUE NOT NULL,
  sellerId TEXT NOT NULL REFERENCES users(id),
  categoryId TEXT NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pricePKR REAL NOT NULL,
  condition TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  riskLevel TEXT NOT NULL DEFAULT 'LOW',
  claimedFields TEXT NOT NULL DEFAULT '{}',
  city TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  expiresAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_listings_category_status ON listings(categoryId, status, createdAt);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(sellerId);
CREATE INDEX IF NOT EXISTS idx_listings_risk ON listings(riskLevel);

CREATE TABLE IF NOT EXISTS listing_media (
  id TEXT PRIMARY KEY,
  listingId TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  mediaType TEXT NOT NULL,
  url TEXT NOT NULL,
  aiFlags TEXT NOT NULL DEFAULT '{}',
  sortOrder INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_media_listing ON listing_media(listingId);

CREATE TABLE IF NOT EXISTS product_verifications (
  id TEXT PRIMARY KEY,
  listingId TEXT UNIQUE NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  verifiedFields TEXT NOT NULL DEFAULT '{}',
  imei TEXT,
  serialNumber TEXT,
  registrationNumber TEXT,
  healthReport TEXT NOT NULL DEFAULT '{}',
  overallHealthScore INTEGER,
  discrepancies TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS risk_scores (
  id TEXT PRIMARY KEY,
  listingId TEXT UNIQUE REFERENCES listings(id) ON DELETE CASCADE,
  userId TEXT UNIQUE REFERENCES users(id),
  overall INTEGER NOT NULL,
  identitySignal INTEGER NOT NULL,
  deviceReputationSignal INTEGER NOT NULL,
  listingBehaviorSignal INTEGER NOT NULL,
  priceAnomalySignal INTEGER NOT NULL,
  accountAgeSignal INTEGER NOT NULL,
  userReportSignal INTEGER NOT NULL,
  imageAnalysisSignal INTEGER NOT NULL,
  locationConsistencySignal INTEGER NOT NULL,
  riskLevel TEXT NOT NULL,
  computedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fraud_queue (
  id TEXT PRIMARY KEY,
  subjectType TEXT NOT NULL,
  subjectId TEXT NOT NULL,
  subjectTitle TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  reviewedBy TEXT,
  reviewedAt TEXT,
  decisionNote TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  orderNumber TEXT UNIQUE NOT NULL,
  listingId TEXT NOT NULL REFERENCES listings(id),
  buyerId TEXT NOT NULL REFERENCES users(id),
  sellerId TEXT NOT NULL REFERENCES users(id),
  totalAmountPKR REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'PLACED',
  confirmedReceiptAt TEXT,
  autoReleaseAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyerId, status);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(sellerId, status);

CREATE TABLE IF NOT EXISTS escrow_transactions (
  id TEXT PRIMARY KEY,
  orderId TEXT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  heldAmountPKR REAL NOT NULL,
  feeAmountPKR REAL NOT NULL,
  state TEXT NOT NULL DEFAULT 'HELD',
  heldForReview INTEGER NOT NULL DEFAULT 0,
  releasedAt TEXT
);

CREATE TABLE IF NOT EXISTS escrow_release_block (
  orderId TEXT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  sellerName TEXT NOT NULL,
  reason TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL REFERENCES orders(id),
  provider TEXT NOT NULL,
  providerTxnRef TEXT UNIQUE NOT NULL,
  amountPKR REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  webhookPayload TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payouts (
  id TEXT PRIMARY KEY,
  sellerId TEXT NOT NULL REFERENCES users(id),
  escrowTransactionId TEXT NOT NULL,
  payoutMethod TEXT NOT NULL,
  amountPKR REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  heldReason TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payouts_seller ON payouts(sellerId);

CREATE TABLE IF NOT EXISTS chat_threads (
  id TEXT PRIMARY KEY,
  listingId TEXT NOT NULL REFERENCES listings(id),
  listingTitle TEXT NOT NULL,
  buyerId TEXT NOT NULL REFERENCES users(id),
  sellerId TEXT NOT NULL REFERENCES users(id),
  counterpartName TEXT NOT NULL,
  hasScamFlag INTEGER NOT NULL DEFAULT 0,
  orderId TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  threadId TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  senderId TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  scamFlag INTEGER NOT NULL DEFAULT 0,
  scamPatternType TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON chat_messages(threadId, createdAt);

CREATE TABLE IF NOT EXISTS scam_reports (
  id TEXT PRIMARY KEY,
  reporterId TEXT NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  evidenceCount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  evidenceHash TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS disputes (
  id TEXT PRIMARY KEY,
  orderId TEXT UNIQUE NOT NULL REFERENCES orders(id),
  orderNumber TEXT NOT NULL,
  openedBy TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'OPENED',
  amountPKR REAL NOT NULL,
  decision TEXT,
  decidedBy TEXT,
  escalatedToAdminId TEXT,
  evidenceWindowClosesAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dispute_evidence (
  id TEXT PRIMARY KEY,
  disputeId TEXT NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  submittedBy TEXT NOT NULL,
  evidenceType TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  sourceThreadId TEXT,
  sourceMessageId TEXT,
  submittedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS digital_certificates (
  id TEXT PRIMARY KEY,
  publicId TEXT UNIQUE NOT NULL,
  certificateNumber TEXT UNIQUE NOT NULL,
  orderId TEXT UNIQUE NOT NULL REFERENCES orders(id),
  itemTitle TEXT NOT NULL,
  amountPKR REAL NOT NULL,
  pdfUrl TEXT NOT NULL,
  qrUrl TEXT NOT NULL,
  issuedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  sellerId TEXT NOT NULL REFERENCES users(id),
  orderId TEXT NOT NULL REFERENCES orders(id),
  authorName TEXT NOT NULL,
  rating INTEGER NOT NULL,
  body TEXT,
  verifiedPurchase INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(sellerId);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS saved_listings (
  userId TEXT NOT NULL REFERENCES users(id),
  listingId TEXT NOT NULL REFERENCES listings(id),
  PRIMARY KEY (userId, listingId)
);

CREATE TABLE IF NOT EXISTS revenue_series (
  month TEXT PRIMARY KEY,
  escrowFees REAL NOT NULL,
  boosts REAL NOT NULL,
  refunds REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS trust_score_trend (
  week TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  score INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actorId TEXT NOT NULL,
  action TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  beforeState TEXT,
  afterState TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entityType, entityId);
