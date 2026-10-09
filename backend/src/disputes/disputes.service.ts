import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { randomUUID, createHash } from 'node:crypto';

@Injectable()
export class DisputesService {
  constructor(private db: DbService) {}

  detail(id: string) {
    const dispute = this.db.get<any>('SELECT * FROM disputes WHERE id = ?', [id]);
    if (!dispute) return null;
    const order = this.db.get<any>('SELECT * FROM orders WHERE id = ?', [dispute.orderId]);
    const buyer = order ? this.db.get<any>('SELECT * FROM users WHERE id = ?', [order.buyerId]) : null;
    const seller = order ? this.db.get<any>('SELECT * FROM users WHERE id = ?', [order.sellerId]) : null;
    const listing = order ? this.db.get<any>('SELECT * FROM listings WHERE id = ?', [order.listingId]) : null;
    const evidence = this.db.all<any>('SELECT * FROM dispute_evidence WHERE disputeId = ? ORDER BY submittedAt', [id]);
    return {
      dispute: {
        id: dispute.id, orderId: dispute.orderId, orderNumber: dispute.orderNumber, openedBy: dispute.openedBy,
        status: dispute.status, amountPKR: dispute.amountPKR, decision: dispute.decision ?? undefined,
        decidedBy: dispute.decidedBy ?? undefined, escalatedToAdminId: dispute.escalatedToAdminId ?? undefined,
        evidenceWindowClosesAt: dispute.evidenceWindowClosesAt ?? undefined, createdAt: dispute.createdAt,
        evidence: evidence.map((e) => ({
          id: e.id, submittedBy: e.submittedBy, evidenceType: e.evidenceType, url: e.url, label: e.label ?? undefined,
          sourceThreadId: e.sourceThreadId ?? undefined, sourceMessageId: e.sourceMessageId ?? undefined, submittedAt: e.submittedAt,
        })),
      },
      order: order ? { id: order.id, orderNumber: order.orderNumber, status: order.status, totalAmountPKR: order.totalAmountPKR } : null,
      buyer: buyer ? { id: buyer.id, fullName: buyer.fullName } : null,
      seller: seller ? { id: seller.id, fullName: seller.fullName } : null,
      listing: listing ? { id: listing.id, title: listing.title } : null,
    };
  }

  all() {
    return this.db.all<any>('SELECT * FROM disputes ORDER BY createdAt DESC');
  }

  addEvidence(disputeId: string, submittedBy: string, input: { evidenceType: string; label?: string; sourceThreadId?: string; sourceMessageId?: string }) {
    const id = `ev_${randomUUID().slice(0, 8)}`;
    this.db.run(
      `INSERT INTO dispute_evidence (id, disputeId, submittedBy, evidenceType, url, label, sourceThreadId, sourceMessageId) VALUES (?,?,?,?,?,?,?,?)`,
      [id, disputeId, submittedBy, input.evidenceType, '#', input.label ?? null, input.sourceThreadId ?? null, input.sourceMessageId ?? null],
    );
    return this.detail(disputeId)?.dispute;
  }

  decide(disputeId: string, adminId: string, decision: 'RELEASE_SELLER' | 'REFUND_BUYER' | 'SPLIT') {
    this.db.run('UPDATE disputes SET status = ?, decision = ?, decidedBy = ? WHERE id = ?', ['RESOLVED', decision, adminId, disputeId]);
    const dispute = this.db.get<any>('SELECT * FROM disputes WHERE id = ?', [disputeId]);
    if (dispute) {
      const escrowState = decision === 'RELEASE_SELLER' ? 'RELEASED' : decision === 'REFUND_BUYER' ? 'REFUNDED' : 'SPLIT';
      this.db.run('UPDATE escrow_transactions SET state = ?, releasedAt = ? WHERE orderId = ?', [escrowState, new Date().toISOString(), dispute.orderId]);
      this.db.run('UPDATE orders SET status = ? WHERE id = ?', [decision === 'REFUND_BUYER' ? 'REFUNDED' : 'COMPLETED', dispute.orderId]);
    }
    return this.detail(disputeId);
  }

  escalate(disputeId: string, adminId: string) {
    this.db.run('UPDATE disputes SET status = ?, escalatedToAdminId = ? WHERE id = ?', ['ESCALATED', adminId, disputeId]);
    return this.detail(disputeId);
  }

  // Scam reports — real 24h duplicate-subject dedup, hashed on (subject) so repeated
  // identical reports within the window are correctly blocked, matching the business rule.
  submitScamReport(reporterId: string, input: { subject: string; reason: string; details: string; evidenceCount: number }) {
    const evidenceHash = createHash('sha256').update(input.subject).digest('hex');
    const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const duplicate = this.db.get<any>(
      'SELECT * FROM scam_reports WHERE evidenceHash = ? AND createdAt > ? ORDER BY createdAt DESC LIMIT 1',
      [evidenceHash, dayAgo],
    );
    if (duplicate) return { duplicate, report: null };
    const id = `sr_${randomUUID().slice(0, 8)}`;
    this.db.run(
      `INSERT INTO scam_reports (id, reporterId, subject, reason, details, evidenceCount, evidenceHash) VALUES (?,?,?,?,?,?,?)`,
      [id, reporterId, input.subject, input.reason, input.details, input.evidenceCount, evidenceHash],
    );
    return { duplicate: null, report: this.db.get<any>('SELECT * FROM scam_reports WHERE id = ?', [id]) };
  }

  scamReports() {
    return this.db.all<any>('SELECT * FROM scam_reports ORDER BY createdAt DESC');
  }
}
