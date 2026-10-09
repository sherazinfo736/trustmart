import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class ListingsService {
  constructor(private db: DbService) {}

  private parseListing(row: any) {
    const media = this.db.all<any>('SELECT * FROM listing_media WHERE listingId = ? ORDER BY sortOrder', [row.id]);
    return {
      id: row.id,
      publicId: row.publicId,
      sellerId: row.sellerId,
      categoryId: row.categoryId,
      title: row.title,
      description: row.description,
      pricePKR: row.pricePKR,
      condition: row.condition,
      status: row.status,
      riskLevel: row.riskLevel,
      claimedFields: JSON.parse(row.claimedFields),
      city: row.city,
      media: media.map((m) => ({ id: m.id, mediaType: m.mediaType, url: m.url, aiFlags: JSON.parse(m.aiFlags) })),
      createdAt: row.createdAt,
      ...(row.expiresAt ? { expiresAt: row.expiresAt } : {}),
      // Risk + verification signals travel WITH the listing in every response —
      // never a side-channel the frontend has to look up separately by ID.
      risk: this.riskBreakdown(row.id),
      verifiedFields: this.verifiedFieldsFor(row.id),
    };
  }

  private verifiedFieldsFor(listingId: string): Record<string, string> {
    const pv = this.db.get<any>('SELECT verifiedFields FROM product_verifications WHERE listingId = ?', [listingId]);
    return pv ? JSON.parse(pv.verifiedFields) : {};
  }

  // Public/buyer browse — HIGH risk listings are NEVER surfaced, enforced here at the query layer
  // (not just hidden in the UI), matching the original mock adapter's rule.
  browse(filters: {
    categorySlug?: string;
    query?: string;
    verifiedOnly?: boolean;
    condition?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) {
    let sql = `SELECT l.* FROM listings l WHERE l.riskLevel != 'HIGH' AND l.status = 'PUBLISHED'`;
    const params: unknown[] = [];
    if (filters.categorySlug) {
      const cat = this.db.get<any>('SELECT id FROM categories WHERE slug = ?', [filters.categorySlug]);
      sql += ' AND l.categoryId = ?';
      params.push(cat?.id ?? '__none__');
    }
    if (filters.query) {
      sql += ' AND (LOWER(l.title) LIKE ? OR LOWER(l.publicId) LIKE ?)';
      const q = `%${filters.query.toLowerCase()}%`;
      params.push(q, q);
    }
    if (filters.verifiedOnly) sql += " AND l.riskLevel = 'LOW'";
    if (filters.condition) { sql += ' AND l.condition = ?'; params.push(filters.condition); }
    if (filters.city) { sql += ' AND l.city = ?'; params.push(filters.city); }
    if (filters.minPrice) { sql += ' AND l.pricePKR >= ?'; params.push(filters.minPrice); }
    if (filters.maxPrice) { sql += ' AND l.pricePKR <= ?'; params.push(filters.maxPrice); }

    if (filters.sort === 'price-asc') sql += ' ORDER BY l.pricePKR ASC';
    else if (filters.sort === 'price-desc') sql += ' ORDER BY l.pricePKR DESC';
    else if (filters.sort === 'trust') sql += ' ORDER BY (SELECT overall FROM risk_scores WHERE listingId = l.id) ASC';
    else sql += ' ORDER BY l.createdAt DESC';

    const rows = this.db.all<any>(sql, params);
    return rows.map((r) => this.parseListing(r));
  }

  cities() {
    const rows = this.db.all<any>('SELECT DISTINCT city FROM listings ORDER BY city');
    return rows.map((r) => r.city);
  }

  categories() {
    return this.db.all<any>('SELECT * FROM categories').map((c) => ({
      id: c.id, slug: c.slug, nameEn: c.nameEn, nameUr: c.nameUr,
      verificationSchema: JSON.parse(c.verificationSchema), escrowEligible: !!c.escrowEligible,
    }));
  }

  detail(id: string) {
    const row = this.db.get<any>('SELECT * FROM listings WHERE id = ?', [id]);
    if (!row) return null;
    const listing = this.parseListing(row);
    const seller = this.sellerPublic(row.sellerId);
    const pv = this.db.get<any>('SELECT * FROM product_verifications WHERE listingId = ?', [id]);
    const category = this.db.get<any>('SELECT * FROM categories WHERE id = ?', [row.categoryId]);
    return {
      listing,
      seller,
      verification: pv
        ? {
            id: pv.id, listingId: pv.listingId, verifiedFields: JSON.parse(pv.verifiedFields),
            imei: pv.imei ?? undefined, serialNumber: pv.serialNumber ?? undefined,
            registrationNumber: pv.registrationNumber ?? undefined,
            healthReport: JSON.parse(pv.healthReport), overallHealthScore: pv.overallHealthScore ?? undefined,
          }
        : null,
      category: category
        ? { id: category.id, slug: category.slug, nameEn: category.nameEn, nameUr: category.nameUr, verificationSchema: JSON.parse(category.verificationSchema), escrowEligible: !!category.escrowEligible }
        : null,
      // Top-level so the frontend never needs a second lookup by listing ID.
      risk: this.riskBreakdown(id),
      discrepancies: pv ? JSON.parse(pv.discrepancies ?? '[]') : [],
    };
  }

  riskBreakdown(listingId: string) {
    const r = this.db.get<any>('SELECT * FROM risk_scores WHERE listingId = ?', [listingId]);
    if (!r) return null;
    return {
      overall: r.overall, identitySignal: r.identitySignal, deviceReputationSignal: r.deviceReputationSignal,
      listingBehaviorSignal: r.listingBehaviorSignal, priceAnomalySignal: r.priceAnomalySignal,
      accountAgeSignal: r.accountAgeSignal, userReportSignal: r.userReportSignal,
      imageAnalysisSignal: r.imageAnalysisSignal, locationConsistencySignal: r.locationConsistencySignal,
      riskLevel: r.riskLevel,
    };
  }

  sellerPublic(sellerId: string) {
    const u = this.db.get<any>('SELECT * FROM users WHERE id = ?', [sellerId]);
    if (!u) return null;
    return { id: u.id, fullName: u.fullName, role: u.role, verificationStatus: u.verificationStatus, trustScore: u.trustScore, createdAt: u.createdAt };
  }

  sellerProfile(sellerId: string) {
    const seller = this.sellerPublic(sellerId);
    if (!seller) return null;
    const listings = this.db
      .all<any>(`SELECT * FROM listings WHERE sellerId = ? AND riskLevel != 'HIGH' AND status = 'PUBLISHED'`, [sellerId])
      .map((r) => this.parseListing(r));
    const reviews = this.db.all<any>('SELECT * FROM reviews WHERE sellerId = ? ORDER BY createdAt DESC', [sellerId]);
    return { seller, listings, reviews };
  }

  reviews(sellerId?: string) {
    if (sellerId) return this.db.all<any>('SELECT * FROM reviews WHERE sellerId = ? ORDER BY createdAt DESC', [sellerId]);
    return this.db.all<any>('SELECT * FROM reviews ORDER BY createdAt DESC');
  }

  savedListings(userId: string) {
    const rows = this.db.all<any>(
      `SELECT l.* FROM listings l JOIN saved_listings s ON s.listingId = l.id WHERE s.userId = ?`,
      [userId],
    );
    return rows.map((r) => this.parseListing(r));
  }

  saveListing(userId: string, listingId: string) {
    const exists = this.db.get('SELECT 1 FROM saved_listings WHERE userId = ? AND listingId = ?', [userId, listingId]);
    if (!exists) this.db.run('INSERT INTO saved_listings (userId, listingId) VALUES (?,?)', [userId, listingId]);
    return { saved: true };
  }

  unsaveListing(userId: string, listingId: string) {
    this.db.run('DELETE FROM saved_listings WHERE userId = ? AND listingId = ?', [userId, listingId]);
    return { saved: false };
  }

  sellerListings(sellerId: string) {
    return this.db.all<any>('SELECT * FROM listings WHERE sellerId = ?', [sellerId]).map((r) => this.parseListing(r));
  }

  // ai-precheck: rules-based demo scoring, same intent as the FastAPI service described in the
  // product blueprint — computes a Low/Medium/High result from simple heuristics so a newly
  // created listing gets a real (if simplified) risk classification instead of a hardcoded value.
  createListing(sellerId: string, input: any) {
    const id = `l_${Date.now().toString(36)}`;
    const publicId = `TM-${(input.categorySlug ?? 'GEN').slice(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 89999)}`;
    const priceSignal = input.pricePKR < 1000 ? 40 : 0;
    const overall = priceSignal + (input.description?.length < 20 ? 20 : 0);
    const riskLevel = overall >= 40 ? 'HIGH' : overall >= 15 ? 'MEDIUM' : 'LOW';
    const status = riskLevel === 'HIGH' ? 'UNDER_REVIEW' : 'PUBLISHED';

    this.db.run(
      `INSERT INTO listings (id, publicId, sellerId, categoryId, title, description, pricePKR, condition, status, riskLevel, claimedFields, city) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, publicId, sellerId, input.categoryId, input.title, input.description, input.pricePKR, input.condition ?? 'USED', status, riskLevel, JSON.stringify(input.claimedFields ?? {}), input.city],
    );
    this.db.run(
      `INSERT INTO risk_scores (id, listingId, overall, identitySignal, deviceReputationSignal, listingBehaviorSignal, priceAnomalySignal, accountAgeSignal, userReportSignal, imageAnalysisSignal, locationConsistencySignal, riskLevel) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [`rs_${id}`, id, overall, 10, 10, 10, priceSignal, 10, 0, 10, 10, riskLevel],
    );
    if (riskLevel === 'HIGH') {
      this.db.run(`INSERT INTO fraud_queue (id, subjectType, subjectId, subjectTitle, city, status) VALUES (?,?,?,?,?,?)`, [
        `fq_${id}`, 'LISTING', id, input.title, input.city, 'NEW',
      ]);
    }
    return { id, publicId, status, riskLevel };
  }
}
