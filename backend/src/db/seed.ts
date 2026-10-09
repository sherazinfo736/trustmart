import { DbService } from './db.service';

/**
 * Seeds the SAME demo dataset the frontend's mock adapter already uses —
 * same IDs (o_1..o_8, t_1/t_2/t_3, d_1/d_2, cm_1..cm_33, etc.) — so the
 * real backend is a drop-in replacement, not a second disconnected dataset.
 * Source of truth for these values: frontend `src/mocks/fixtures/index.ts`.
 */
export function seed(dbs: DbService) {
  if (!dbs.isEmpty()) return;
  const db = dbs.db;
  const j = (v: unknown) => JSON.stringify(v);
  const now = () => new Date().toISOString();

  // ── Users ──
  const users = [
    { id: 'u_buyer_1', fullName: 'Ayesha Khan', phone: '+92 300 1234567', email: 'ayesha@example.com', role: 'BUYER', verificationStatus: 'VERIFIED', trustScore: 82, languagePref: 'en', createdAt: '2025-03-14T09:00:00Z' },
    { id: 'u_buyer_2', fullName: 'Hassan Raza', phone: '+92 301 5551234', email: 'hassan@example.com', role: 'BUYER', verificationStatus: 'VERIFIED', trustScore: 65, languagePref: 'en', createdAt: '2025-05-10T09:00:00Z' },
    { id: 'u_seller_1', fullName: 'Bilal Traders', phone: '+92 321 7654321', email: null, role: 'BUSINESS_SELLER', verificationStatus: 'VERIFIED', trustScore: 91, languagePref: 'en', createdAt: '2024-11-02T09:00:00Z' },
    { id: 'u_seller_2', fullName: 'Karachi Mobile Hub', phone: '+92 345 1112223', email: null, role: 'SELLER', verificationStatus: 'VERIFIED', trustScore: 74, languagePref: 'ur', createdAt: '2025-01-20T09:00:00Z' },
    { id: 'u_seller_3', fullName: 'Usman Auto', phone: '+92 302 4445556', email: null, role: 'SELLER', verificationStatus: 'PENDING', trustScore: 41, languagePref: 'en', createdAt: '2026-07-28T09:00:00Z' },
    { id: 'u_admin_1', fullName: 'Hamza Raza', phone: '+92 333 9990000', email: null, role: 'SENIOR_ADMIN', verificationStatus: 'VERIFIED', trustScore: 100, languagePref: 'en', createdAt: '2024-06-02T09:00:00Z' },
  ];
  for (const u of users) {
    db.exec(
      `INSERT INTO users (id, fullName, phone, email, role, verificationStatus, trustScore, languagePref, createdAt)
       VALUES ('${u.id}', '${u.fullName}', '${u.phone}', ${u.email ? `'${u.email}'` : 'NULL'}, '${u.role}', '${u.verificationStatus}', ${u.trustScore}, '${u.languagePref}', '${u.createdAt}')`,
    );
  }

  // ── Categories ──
  const categories = [
    { id: 'cat_mobiles', slug: 'mobiles', nameEn: 'Mobile Phones', nameUr: 'موبائل فون', schema: { imei: 'text', boxPhoto: 'image', powerOnVideo: 'video' } },
    { id: 'cat_cars', slug: 'cars', nameEn: 'Cars', nameUr: 'گاڑیاں', schema: { registrationNumber: 'text', chassisPhoto: 'image' } },
    { id: 'cat_laptops', slug: 'laptops', nameEn: 'Laptops', nameUr: 'لیپ ٹاپ', schema: { serialNumber: 'text', specsScreenshot: 'image' } },
    { id: 'cat_bikes', slug: 'bikes', nameEn: 'Bikes', nameUr: 'موٹر سائیکل', schema: { registrationNumber: 'text', engineNumber: 'text' } },
  ];
  for (const c of categories) {
    dbs.run(`INSERT INTO categories (id, slug, nameEn, nameUr, verificationSchema, escrowEligible) VALUES (?, ?, ?, ?, ?, 1)`, [
      c.id, c.slug, c.nameEn, c.nameUr, j(c.schema),
    ]);
  }

  // ── Listings (l_1-l_8) ──
  const listings = [
    { id: 'l_1', publicId: 'TM-PH-88213', sellerId: 'u_seller_1', categoryId: 'cat_mobiles', title: 'iPhone 14 Pro 256GB — PTA Approved', description: 'Single owner, box and original charger included. IMEI submitted for platform verification. Battery health 91%.', pricePKR: 289000, condition: 'USED', status: 'PUBLISHED', riskLevel: 'LOW', claimedFields: { imei: '35••••••••••219', boxIncluded: true, batteryHealth: '91%' }, city: 'Lahore', createdAt: '2026-08-04T10:00:00Z' },
    { id: 'l_2', publicId: 'TM-CR-40912', sellerId: 'u_seller_3', categoryId: 'cat_cars', title: 'Toyota Corolla Altis 1.6 — 2019', description: 'Registered Lahore, 74,000 km. Registration number submitted; awaiting platform verification against records.', pricePKR: 6450000, condition: 'USED', status: 'UNDER_REVIEW', riskLevel: 'HIGH', claimedFields: { registrationNumber: 'LEB-19-••••', mileage: '74,000 km' }, city: 'Lahore', createdAt: '2026-08-07T08:20:00Z' },
    { id: 'l_3', publicId: 'TM-LT-11238', sellerId: 'u_seller_2', categoryId: 'cat_laptops', title: 'MacBook Air M2 8/256 — Warranty Left', description: 'Serial verified by platform. 42 charge cycles, no dents, AppleCare until Feb 2027.', pricePKR: 231000, condition: 'REFURBISHED', status: 'PUBLISHED', riskLevel: 'LOW', claimedFields: { serialNumber: 'C02••••••XZ', cycles: '42' }, city: 'Karachi', createdAt: '2026-08-02T12:00:00Z' },
    { id: 'l_4', publicId: 'TM-BK-77341', sellerId: 'u_seller_2', categoryId: 'cat_bikes', title: 'Honda CG 125 — 2022 Model', description: "Registration in seller's own name. Engine and chassis photos uploaded for verification.", pricePKR: 214000, condition: 'USED', status: 'PUBLISHED', riskLevel: 'MEDIUM', claimedFields: { registrationNumber: 'KHI-22-••••', engineNumber: 'JC••••41' }, city: 'Karachi', createdAt: '2026-08-06T15:30:00Z' },
    { id: 'l_5', publicId: 'TM-PH-55021', sellerId: 'u_seller_2', categoryId: 'cat_mobiles', title: 'Samsung Galaxy S23 128GB — Claimed Only', description: 'Seller has stated all details. No platform verification submitted yet, so every field below is a seller claim.', pricePKR: 174500, condition: 'USED', status: 'PUBLISHED', riskLevel: 'MEDIUM', claimedFields: { imei: '35••••••••••701', boxIncluded: false, batteryHealth: '88%' }, city: 'Islamabad', createdAt: '2026-08-05T09:10:00Z' },
    { id: 'l_6', publicId: 'TM-LT-66120', sellerId: 'u_seller_1', categoryId: 'cat_laptops', title: 'Dell XPS 13 i7 — Fully Platform Verified', description: 'Serial number and specs screenshot verified by TrustMart. Seller added no unverified claims.', pricePKR: 198000, condition: 'REFURBISHED', status: 'PUBLISHED', riskLevel: 'LOW', claimedFields: {}, city: 'Lahore', createdAt: '2026-08-03T09:10:00Z' },
    { id: 'l_7', publicId: 'TM-BK-90233', sellerId: 'u_seller_1', categoryId: 'cat_bikes', title: 'Yamaha YBR 125G — 2023', description: 'Registration verified. Low mileage, single owner, all documents in seller\u2019s name.', pricePKR: 329000, condition: 'USED', status: 'PUBLISHED', riskLevel: 'LOW', claimedFields: { mileage: '9,400 km' }, city: 'Faisalabad', createdAt: '2026-08-01T09:10:00Z' },
    { id: 'l_8', publicId: 'TM-CR-31877', sellerId: 'u_seller_2', categoryId: 'cat_cars', title: 'Suzuki Cultus VXL — 2020', description: 'Registration verified against records. Mileage is a seller claim pending inspection.', pricePKR: 3980000, condition: 'USED', status: 'PUBLISHED', riskLevel: 'MEDIUM', claimedFields: { mileage: '48,000 km', accidentFree: true }, city: 'Karachi', createdAt: '2026-07-29T09:10:00Z' },
  ];
  const mediaUrl: Record<string, string> = { cat_mobiles: '/assets/listing-phone.jpg', cat_cars: '/assets/listing-car.jpg', cat_laptops: '/assets/listing-laptop.jpg', cat_bikes: '/assets/listing-bike.jpg' };
  for (const l of listings) {
    dbs.run(
      `INSERT INTO listings (id, publicId, sellerId, categoryId, title, description, pricePKR, condition, status, riskLevel, claimedFields, city, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [l.id, l.publicId, l.sellerId, l.categoryId, l.title, l.description, l.pricePKR, l.condition, l.status, l.riskLevel, j(l.claimedFields), l.city, l.createdAt],
    );
    dbs.run(`INSERT INTO listing_media (id, listingId, mediaType, url, aiFlags, sortOrder) VALUES (?,?,?,?,?,0)`, [
      `m_${l.id}`, l.id, 'IMAGE', mediaUrl[l.categoryId], j(l.id === 'l_2' ? { duplicate: true } : l.id === 'l_4' ? { blurry: true } : {}),
    ]);
  }

  // ── Product verifications ── (l_5 = claimed only, l_6 = verified only, l_8 = verified w/ discrepancy)
  const pvs = [
    { id: 'pv_1', listingId: 'l_1', verifiedFields: { imei: 'verified', boxPhoto: 'verified_screenshot', powerOnVideo: 'verified_video', batteryHealth: 'unverified' }, imei: '35••••••••••219', healthReport: { screen: 'good', battery: 'fair', camera: 'good', speakers: 'good', chargingPort: 'good', faceId: 'good' }, overallHealthScore: 88 },
    { id: 'pv_2', listingId: 'l_2', verifiedFields: { registrationNumber: 'pending', chassisPhoto: 'unverified' }, registrationNumber: 'LEB-19-••••', healthReport: { engine: 'good', bodywork: 'fair', tyres: 'poor', ac: 'good' }, overallHealthScore: 64 },
    { id: 'pv_3', listingId: 'l_3', verifiedFields: { serialNumber: 'verified', specsScreenshot: 'verified_screenshot' }, serialNumber: 'C02••••••XZ', healthReport: { display: 'good', battery: 'good', keyboard: 'good', ports: 'good' }, overallHealthScore: 94 },
    { id: 'pv_4', listingId: 'l_4', verifiedFields: { registrationNumber: 'verified_screenshot', engineNumber: 'pending' }, registrationNumber: 'KHI-22-••••', healthReport: { engine: 'good', tyres: 'fair', brakes: 'fair', lights: 'good' }, overallHealthScore: 76 },
    { id: 'pv_5', listingId: 'l_5', verifiedFields: {}, healthReport: {}, overallHealthScore: null },
    { id: 'pv_6', listingId: 'l_6', verifiedFields: { serialNumber: 'verified', specsScreenshot: 'verified_screenshot' }, serialNumber: '8F••••••Q2', healthReport: { display: 'good', battery: 'good', keyboard: 'good', ports: 'good' }, overallHealthScore: 92 },
    { id: 'pv_7', listingId: 'l_7', verifiedFields: { registrationNumber: 'verified', engineNumber: 'verified_screenshot' }, registrationNumber: 'FSD-23-••••', healthReport: { engine: 'good', tyres: 'good', brakes: 'good', lights: 'fair' }, overallHealthScore: 89 },
    { id: 'pv_8', listingId: 'l_8', verifiedFields: { registrationNumber: 'verified', chassisPhoto: 'verified_screenshot' }, registrationNumber: 'AKK-20-••••', healthReport: { engine: 'good', bodywork: 'fair', tyres: 'fair', ac: 'poor' }, overallHealthScore: 71 },
  ];
  const discrepancies: Record<string, Array<{ field: string; claimed: string; verified: string }>> = {
    l_8: [
      { field: 'mileage', claimed: '48,000 km', verified: '63,100 km on last inspection record' },
      { field: 'accidentFree', claimed: 'Yes', verified: 'One recorded body repair claim (2022)' },
    ],
  };
  for (const p of pvs) {
    dbs.run(
      `INSERT INTO product_verifications (id, listingId, verifiedFields, imei, serialNumber, registrationNumber, healthReport, overallHealthScore, discrepancies) VALUES (?,?,?,?,?,?,?,?,?)`,
      [p.id, p.listingId, j(p.verifiedFields), (p as any).imei ?? null, (p as any).serialNumber ?? null, (p as any).registrationNumber ?? null, j(p.healthReport), p.overallHealthScore, j(discrepancies[p.listingId] ?? [])],
    );
  }

  // ── Risk breakdowns (fixed demo scores, never computed live) ──
  const risks: Record<string, any> = {
    l_1: { overall: 14, identitySignal: 5, deviceReputationSignal: 10, listingBehaviorSignal: 12, priceAnomalySignal: 18, accountAgeSignal: 8, userReportSignal: 0, imageAnalysisSignal: 11, locationConsistencySignal: 6, riskLevel: 'LOW' },
    l_2: { overall: 82, identitySignal: 71, deviceReputationSignal: 64, listingBehaviorSignal: 88, priceAnomalySignal: 93, accountAgeSignal: 90, userReportSignal: 55, imageAnalysisSignal: 87, locationConsistencySignal: 60, riskLevel: 'HIGH' },
    l_3: { overall: 11, identitySignal: 4, deviceReputationSignal: 9, listingBehaviorSignal: 8, priceAnomalySignal: 15, accountAgeSignal: 12, userReportSignal: 0, imageAnalysisSignal: 10, locationConsistencySignal: 5, riskLevel: 'LOW' },
    l_4: { overall: 48, identitySignal: 22, deviceReputationSignal: 35, listingBehaviorSignal: 51, priceAnomalySignal: 44, accountAgeSignal: 30, userReportSignal: 25, imageAnalysisSignal: 68, locationConsistencySignal: 40, riskLevel: 'MEDIUM' },
    l_5: { overall: 44, identitySignal: 30, deviceReputationSignal: 28, listingBehaviorSignal: 47, priceAnomalySignal: 52, accountAgeSignal: 26, userReportSignal: 12, imageAnalysisSignal: 58, locationConsistencySignal: 33, riskLevel: 'MEDIUM' },
    l_6: { overall: 9, identitySignal: 3, deviceReputationSignal: 7, listingBehaviorSignal: 6, priceAnomalySignal: 12, accountAgeSignal: 5, userReportSignal: 0, imageAnalysisSignal: 8, locationConsistencySignal: 4, riskLevel: 'LOW' },
    l_7: { overall: 17, identitySignal: 6, deviceReputationSignal: 12, listingBehaviorSignal: 14, priceAnomalySignal: 22, accountAgeSignal: 9, userReportSignal: 4, imageAnalysisSignal: 19, locationConsistencySignal: 11, riskLevel: 'LOW' },
    l_8: { overall: 57, identitySignal: 21, deviceReputationSignal: 39, listingBehaviorSignal: 44, priceAnomalySignal: 71, accountAgeSignal: 18, userReportSignal: 33, imageAnalysisSignal: 49, locationConsistencySignal: 62, riskLevel: 'MEDIUM' },
  };
  for (const [listingId, r] of Object.entries(risks)) {
    dbs.run(
      `INSERT INTO risk_scores (id, listingId, overall, identitySignal, deviceReputationSignal, listingBehaviorSignal, priceAnomalySignal, accountAgeSignal, userReportSignal, imageAnalysisSignal, locationConsistencySignal, riskLevel) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [`rs_${listingId}`, listingId, r.overall, r.identitySignal, r.deviceReputationSignal, r.listingBehaviorSignal, r.priceAnomalySignal, r.accountAgeSignal, r.userReportSignal, r.imageAnalysisSignal, r.locationConsistencySignal, r.riskLevel],
    );
  }

  // ── Orders (o_1-o_8) ──
  const orders = [
    { id: 'o_1', orderNumber: 'TM-ORD-100482', listingId: 'l_1', buyerId: 'u_buyer_1', sellerId: 'u_seller_1', totalAmountPKR: 292890, status: 'PAYMENT_CONFIRMED', autoReleaseAt: null, createdAt: '2026-08-11T12:00:00Z' },
    { id: 'o_2', orderNumber: 'TM-ORD-100455', listingId: 'l_3', buyerId: 'u_buyer_1', sellerId: 'u_seller_2', totalAmountPKR: 233310, status: 'SHIPPED', autoReleaseAt: '2026-08-18T12:00:00Z', createdAt: '2026-08-08T10:00:00Z' },
    { id: 'o_3', orderNumber: 'TM-ORD-100496', listingId: 'l_6', buyerId: 'u_buyer_1', sellerId: 'u_seller_1', totalAmountPKR: 201470, status: 'DELIVERED', autoReleaseAt: '2026-08-15T09:00:00Z', createdAt: '2026-08-06T09:00:00Z' },
    { id: 'o_4', orderNumber: 'TM-ORD-100433', listingId: 'l_7', buyerId: 'u_buyer_1', sellerId: 'u_seller_1', totalAmountPKR: 334435, status: 'DELIVERED', autoReleaseAt: '2026-08-05T09:00:00Z', createdAt: '2026-07-27T09:00:00Z' },
    { id: 'o_5', orderNumber: 'TM-ORD-100501', listingId: 'l_4', buyerId: 'u_buyer_1', sellerId: 'u_seller_2', totalAmountPKR: 216140, status: 'DISPUTED', autoReleaseAt: null, createdAt: '2026-08-01T09:00:00Z' },
    { id: 'o_6', orderNumber: 'TM-ORD-100512', listingId: 'l_2', buyerId: 'u_buyer_1', sellerId: 'u_seller_3', totalAmountPKR: 6482250, status: 'CANCELLED', autoReleaseAt: null, createdAt: '2026-08-09T18:40:00Z' },
    { id: 'o_7', orderNumber: 'TM-ORD-100519', listingId: 'l_8', buyerId: 'u_buyer_1', sellerId: 'u_seller_3', totalAmountPKR: 4040200, status: 'DELIVERED', autoReleaseAt: '2026-08-17T09:00:00Z', createdAt: '2026-08-07T09:00:00Z' },
    { id: 'o_8', orderNumber: 'TM-ORD-100388', listingId: 'l_5', buyerId: 'u_buyer_2', sellerId: 'u_seller_2', totalAmountPKR: 177118, status: 'DISPUTED', autoReleaseAt: null, createdAt: '2026-07-22T09:00:00Z' },
  ];
  for (const o of orders) {
    dbs.run(`INSERT INTO orders (id, orderNumber, listingId, buyerId, sellerId, totalAmountPKR, status, autoReleaseAt, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`, [
      o.id, o.orderNumber, o.listingId, o.buyerId, o.sellerId, o.totalAmountPKR, o.status, o.autoReleaseAt, o.createdAt,
    ]);
  }

  // ── Escrow ──
  const escrow = [
    { id: 'esc_1', orderId: 'o_1', heldAmountPKR: 289000, feeAmountPKR: 3890, state: 'HELD', heldForReview: 0, releasedAt: null },
    { id: 'esc_2', orderId: 'o_2', heldAmountPKR: 231000, feeAmountPKR: 2310, state: 'HELD', heldForReview: 0, releasedAt: null },
    { id: 'esc_3', orderId: 'o_3', heldAmountPKR: 198000, feeAmountPKR: 2970, state: 'HELD', heldForReview: 0, releasedAt: null },
    { id: 'esc_4', orderId: 'o_4', heldAmountPKR: 329000, feeAmountPKR: 4935, state: 'RELEASED', heldForReview: 0, releasedAt: '2026-08-05T09:05:00Z' },
    { id: 'esc_5', orderId: 'o_5', heldAmountPKR: 214000, feeAmountPKR: 2140, state: 'HELD', heldForReview: 1, releasedAt: null },
    { id: 'esc_6', orderId: 'o_6', heldAmountPKR: 6450000, feeAmountPKR: 0, state: 'REFUNDED', heldForReview: 0, releasedAt: null },
    { id: 'esc_7', orderId: 'o_7', heldAmountPKR: 3980000, feeAmountPKR: 59700, state: 'HELD', heldForReview: 1, releasedAt: null },
    { id: 'esc_8', orderId: 'o_8', heldAmountPKR: 174500, feeAmountPKR: 2618, state: 'HELD', heldForReview: 1, releasedAt: null },
  ];
  for (const e of escrow) {
    dbs.run(`INSERT INTO escrow_transactions (id, orderId, heldAmountPKR, feeAmountPKR, state, heldForReview, releasedAt) VALUES (?,?,?,?,?,?,?)`, [
      e.id, e.orderId, e.heldAmountPKR, e.feeAmountPKR, e.state, e.heldForReview, e.releasedAt,
    ]);
  }
  dbs.run(`INSERT INTO escrow_release_block (orderId, sellerName, reason) VALUES (?,?,?)`, [
    'o_7', 'Usman Auto',
    "This seller's account is being reviewed by our fraud team, so release is paused. Your money stays safely in escrow — nothing is lost and you do not need to do anything. If the review clears, payment releases automatically; if it does not, you are refunded in full.",
  ]);

  // ── Payouts ──
  const payouts = [
    { id: 'p_1', sellerId: 'u_seller_1', escrowTransactionId: 'esc_2', payoutMethod: 'EASYPAISA', amountPKR: 228690, status: 'PROCESSED', heldReason: null, createdAt: '2026-07-31T09:00:00Z' },
    { id: 'p_2', sellerId: 'u_seller_1', escrowTransactionId: 'esc_2', payoutMethod: 'BANK', amountPKR: 285110, status: 'PENDING', heldReason: null, createdAt: '2026-08-09T09:00:00Z' },
    { id: 'p_3', sellerId: 'u_seller_1', escrowTransactionId: 'esc_5', payoutMethod: 'JAZZCASH', amountPKR: 211860, status: 'ON_HOLD', heldReason: 'Order under dispute review — payout blocked until decision.', createdAt: '2026-08-05T09:00:00Z' },
  ];
  for (const p of payouts) {
    dbs.run(`INSERT INTO payouts (id, sellerId, escrowTransactionId, payoutMethod, amountPKR, status, heldReason, createdAt) VALUES (?,?,?,?,?,?,?,?)`, [
      p.id, p.sellerId, p.escrowTransactionId, p.payoutMethod, p.amountPKR, p.status, p.heldReason, p.createdAt,
    ]);
  }

  // ── Chat threads + messages (t_1 -> o_1, t_3 -> o_5) ──
  const threads = [
    { id: 't_1', listingId: 'l_1', listingTitle: 'iPhone 14 Pro 256GB', buyerId: 'u_buyer_1', sellerId: 'u_seller_1', counterpartName: 'Bilal Traders', hasScamFlag: 0, orderId: 'o_1' },
    { id: 't_2', listingId: 'l_2', listingTitle: 'Toyota Corolla Altis 1.6', buyerId: 'u_buyer_1', sellerId: 'u_seller_3', counterpartName: 'Usman Auto', hasScamFlag: 1, orderId: null },
    { id: 't_3', listingId: 'l_4', listingTitle: 'Honda CG 125 — 2022 Model', buyerId: 'u_buyer_1', sellerId: 'u_seller_2', counterpartName: 'Karachi Mobile Hub', hasScamFlag: 1, orderId: 'o_5' },
  ];
  for (const t of threads) {
    dbs.run(`INSERT INTO chat_threads (id, listingId, listingTitle, buyerId, sellerId, counterpartName, hasScamFlag, orderId) VALUES (?,?,?,?,?,?,?,?)`, [
      t.id, t.listingId, t.listingTitle, t.buyerId, t.sellerId, t.counterpartName, t.hasScamFlag, t.orderId,
    ]);
  }
  const messages = [
    { id: 'cm_1', threadId: 't_1', senderId: 'u_buyer_1', body: 'Is the box and original charger included?', scamFlag: 0, scamPatternType: null, createdAt: '2026-08-09T09:02:00Z' },
    { id: 'cm_2', threadId: 't_1', senderId: 'u_seller_1', body: 'Yes, both included. IMEI is platform verified on the listing.', scamFlag: 0, scamPatternType: null, createdAt: '2026-08-09T09:04:00Z' },
    { id: 'cm_3', threadId: 't_1', senderId: 'u_seller_1', body: "Escrow payment is the safest way — I've enabled it on the listing.", scamFlag: 0, scamPatternType: null, createdAt: '2026-08-09T09:05:00Z' },
    { id: 'cm_4', threadId: 't_2', senderId: 'u_buyer_1', body: 'Can I inspect the car this weekend?', scamFlag: 0, scamPatternType: null, createdAt: '2026-08-09T14:00:00Z' },
    { id: 'cm_5', threadId: 't_2', senderId: 'u_seller_3', body: 'Send 20,000 advance on this Easypaisa number to hold the car.', scamFlag: 1, scamPatternType: 'ADVANCE_PAYMENT', createdAt: '2026-08-09T14:03:00Z' },
    { id: 'cm_6', threadId: 't_2', senderId: 'u_seller_3', body: 'Also share the OTP you receive so I can confirm the booking.', scamFlag: 1, scamPatternType: 'OTP_REQUEST', createdAt: '2026-08-09T14:05:00Z' },
    { id: 'cm_31', threadId: 't_3', senderId: 'u_buyer_1', body: 'Order TM-ORD-100501 is paid into escrow. When is the bike being dispatched?', scamFlag: 0, scamPatternType: null, createdAt: '2026-08-02T10:00:00Z' },
    { id: 'cm_32', threadId: 't_3', senderId: 'u_seller_2', body: 'Dispatching tomorrow, our own rider will bring it.', scamFlag: 0, scamPatternType: null, createdAt: '2026-08-02T10:06:00Z' },
    { id: 'cm_33', threadId: 't_3', senderId: 'u_seller_2', body: 'Pay the courier 3,500 delivery fee directly when he calls you.', scamFlag: 1, scamPatternType: 'FAKE_COURIER', createdAt: '2026-08-03T11:20:00Z' },
  ];
  for (const m of messages) {
    dbs.run(`INSERT INTO chat_messages (id, threadId, senderId, body, scamFlag, scamPatternType, createdAt) VALUES (?,?,?,?,?,?,?)`, [
      m.id, m.threadId, m.senderId, m.body, m.scamFlag, m.scamPatternType, m.createdAt,
    ]);
  }

  // ── Disputes (d_1 against o_5, d_2 against o_8) ──
  dbs.run(`INSERT INTO disputes (id, orderId, orderNumber, openedBy, status, amountPKR, evidenceWindowClosesAt, createdAt) VALUES (?,?,?,?,?,?,?,?)`, [
    'd_1', 'o_5', 'TM-ORD-100501', 'u_buyer_1', 'EVIDENCE_COLLECTION', 216140, new Date(Date.now() + 4 * 60 * 1000).toISOString(), '2026-08-04T09:00:00Z',
  ]);
  dbs.run(`INSERT INTO disputes (id, orderId, orderNumber, openedBy, status, amountPKR, createdAt) VALUES (?,?,?,?,?,?,?)`, [
    'd_2', 'o_8', 'TM-ORD-100388', 'u_buyer_2', 'ESCALATED', 177118, '2026-07-24T09:00:00Z',
  ]);
  const evidence = [
    { id: 'ev_1', disputeId: 'd_1', submittedBy: 'u_buyer_1', evidenceType: 'PHOTO', url: '#', label: 'Photo of the delivered bike — engine number does not match the listing', sourceThreadId: null, sourceMessageId: null, submittedAt: '2026-08-04T09:05:00Z' },
    { id: 'ev_2', disputeId: 'd_1', submittedBy: 'u_buyer_1', evidenceType: 'CHAT_SCREENSHOT', url: '#', label: 'Chat screenshot: seller asked for a 3,500 courier fee outside TrustMart', sourceThreadId: 't_3', sourceMessageId: 'cm_33', submittedAt: '2026-08-04T09:07:00Z' },
    { id: 'ev_3', disputeId: 'd_1', submittedBy: 'u_seller_2', evidenceType: 'RECEIPT', url: '#', label: 'Seller dispatch receipt', sourceThreadId: null, sourceMessageId: null, submittedAt: '2026-08-04T15:00:00Z' },
    { id: 'ev_4', disputeId: 'd_2', submittedBy: 'u_buyer_2', evidenceType: 'VIDEO', url: '#', label: 'Unboxing video showing a different model', sourceThreadId: null, sourceMessageId: null, submittedAt: '2026-07-24T09:10:00Z' },
  ];
  for (const e of evidence) {
    dbs.run(`INSERT INTO dispute_evidence (id, disputeId, submittedBy, evidenceType, url, label, sourceThreadId, sourceMessageId, submittedAt) VALUES (?,?,?,?,?,?,?,?,?)`, [
      e.id, e.disputeId, e.submittedBy, e.evidenceType, e.url, e.label, e.sourceThreadId, e.sourceMessageId, e.submittedAt,
    ]);
  }

  // ── Certificates ──
  dbs.run(`INSERT INTO digital_certificates (id, publicId, certificateNumber, orderId, itemTitle, amountPKR, pdfUrl, qrUrl, issuedAt) VALUES (?,?,?,?,?,?,?,?,?)`, [
    'c_1', 'cert-9f31a', 'TM-CERT-2026-004821', 'o_4', 'Yamaha YBR 125G — 2023', 329000, '#', '#', '2026-08-05T12:00:00Z',
  ]);

  // ── Fraud queue ──
  const fq = [
    { id: 'fq_1', subjectType: 'LISTING', subjectId: 'l_2', subjectTitle: 'Toyota Corolla Altis 1.6 — 2019', city: 'Lahore', status: 'NEW', createdAt: '2026-08-07T08:30:00Z' },
    { id: 'fq_2', subjectType: 'LISTING', subjectId: 'l_4', subjectTitle: 'Honda CG 125 — 2022 Model', city: 'Karachi', status: 'IN_REVIEW', createdAt: '2026-08-06T16:00:00Z' },
    { id: 'fq_3', subjectType: 'ACCOUNT', subjectId: 'u_seller_3', subjectTitle: 'Usman Auto (account)', city: 'Lahore', status: 'NEW', createdAt: '2026-08-09T07:15:00Z' },
  ];
  for (const f of fq) {
    dbs.run(`INSERT INTO fraud_queue (id, subjectType, subjectId, subjectTitle, city, status, createdAt) VALUES (?,?,?,?,?,?,?)`, [
      f.id, f.subjectType, f.subjectId, f.subjectTitle, f.city, f.status, f.createdAt,
    ]);
  }

  // ── Revenue + trust trend ──
  const revenue = [
    { month: 'Feb', escrowFees: 1.2, boosts: 0.4, refunds: 0.1 },
    { month: 'Mar', escrowFees: 1.6, boosts: 0.5, refunds: 0.14 },
    { month: 'Apr', escrowFees: 2.1, boosts: 0.6, refunds: 0.12 },
    { month: 'May', escrowFees: 2.4, boosts: 0.72, refunds: 0.19 },
    { month: 'Jun', escrowFees: 3.0, boosts: 0.81, refunds: 0.16 },
    { month: 'Jul', escrowFees: 3.6, boosts: 0.95, refunds: 0.22 },
  ];
  for (const r of revenue) dbs.run(`INSERT INTO revenue_series (month, escrowFees, boosts, refunds) VALUES (?,?,?,?)`, [r.month, r.escrowFees, r.boosts, r.refunds]);

  const trend = [72, 76, 79, 84, 88, 91];
  trend.forEach((score, i) => dbs.run(`INSERT INTO trust_score_trend (week, userId, score) VALUES (?,?,?)`, [`W${i + 1}`, 'u_seller_1', score]));

  // ── Reviews ──
  const reviews = [
    { id: 'rv_1', sellerId: 'u_seller_1', orderId: 'o_1', authorName: 'Ayesha K.', rating: 5, body: 'IMEI matched exactly what the listing said. Escrow released after I confirmed receipt.', verifiedPurchase: 1, createdAt: '2026-08-09T09:00:00Z' },
    { id: 'rv_2', sellerId: 'u_seller_2', orderId: 'o_2', authorName: 'Hassan R.', rating: 4, body: 'Laptop as described, packaging could be better. Certificate issued next day.', verifiedPurchase: 1, createdAt: '2026-07-31T09:00:00Z' },
    { id: 'rv_3', sellerId: 'u_seller_2', orderId: 'o_3', authorName: 'Nida S.', rating: 2, body: 'Bike condition did not match the health report. Dispute is under review.', verifiedPurchase: 1, createdAt: '2026-08-04T09:00:00Z' },
    { id: 'rv_4', sellerId: 'u_seller_1', orderId: 'o_2', authorName: 'Faisal A.', rating: 5, body: 'Verified seller, quick shipping, no advance payment requested at any point.', verifiedPurchase: 1, createdAt: '2026-07-20T09:00:00Z' },
  ];
  for (const r of reviews) {
    dbs.run(`INSERT INTO reviews (id, sellerId, orderId, authorName, rating, body, verifiedPurchase, createdAt) VALUES (?,?,?,?,?,?,?,?)`, [
      r.id, r.sellerId, r.orderId, r.authorName, r.rating, r.body, r.verifiedPurchase, r.createdAt,
    ]);
  }

  // ── Notifications (buyer) ──
  const notifs = [
    { id: 'n_1', userId: 'u_buyer_1', kind: 'SCAM', title: 'Scam pattern detected', body: 'A message in your chat with Usman Auto asked for an advance payment and an OTP.', read: 0, createdAt: '2026-08-09T14:06:00Z' },
    { id: 'n_2', userId: 'u_buyer_1', kind: 'ESCROW', title: 'Escrow holding your payment', body: 'Order TM-ORD-100482 shipped. Funds stay in escrow until you confirm receipt.', read: 0, createdAt: '2026-08-08T13:00:00Z' },
    { id: 'n_3', userId: 'u_buyer_1', kind: 'CERTIFICATE', title: 'Digital certificate issued', body: 'Certificate TM-CERT-2026-004821 is ready for Yamaha YBR 125G — 2023.', read: 1, createdAt: '2026-08-05T12:05:00Z' },
    { id: 'n_4', userId: 'u_buyer_1', kind: 'DISPUTE', title: 'Dispute under review', body: 'Order TM-ORD-100501 is with the TrustMart dispute team. Escrow release is blocked.', read: 1, createdAt: '2026-08-04T10:00:00Z' },
  ];
  for (const n of notifs) {
    dbs.run(`INSERT INTO notifications (id, userId, kind, title, body, read, createdAt) VALUES (?,?,?,?,?,?,?)`, [
      n.id, n.userId, n.kind, n.title, n.body, n.read, n.createdAt,
    ]);
  }

  // ── Saved listings ──
  for (const lid of ['l_1', 'l_6', 'l_8']) dbs.run(`INSERT INTO saved_listings (userId, listingId) VALUES (?,?)`, ['u_buyer_1', lid]);

  // ── Scam reports (seeded one, for the 24h dedup demo) ──
  dbs.run(`INSERT INTO scam_reports (id, reporterId, subject, reason, details, evidenceCount, status, evidenceHash, createdAt) VALUES (?,?,?,?,?,?,?,?,?)`, [
    'sr_1', 'u_buyer_1', 't_2 — Usman Auto (Toyota Corolla Altis 1.6)', 'ADVANCE_PAYMENT',
    'Seller asked for a 20,000 advance on Easypaisa and then requested my OTP.', 2, 'PENDING',
    'seed_hash_sr_1', new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  ]);

  console.log('[seed] TrustMart demo dataset seeded (o_1-o_8, t_1-t_3, d_1/d_2, cm_1-cm_33).');
}
