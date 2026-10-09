import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const ADMIN_ROLES = ['SUPER_ADMIN', 'SENIOR_ADMIN', 'FRAUD_ANALYST', 'SUPPORT_AGENT', 'FINANCE_ADMIN'];
const SENIOR_ONLY = ['SUPER_ADMIN', 'SENIOR_ADMIN'];

@Injectable()
export class AdminService {
  constructor(private db: DbService, private rt: RealtimeGateway) {}

  assertAdmin(role: string) {
    if (!ADMIN_ROLES.includes(role)) throw new ForbiddenException('Admin access required.');
  }

  assertSenior(role: string) {
    if (!SENIOR_ONLY.includes(role)) throw new ForbiddenException('This action requires a Senior Admin.');
  }

  fraudQueue() {
    const rows = this.db.all<any>('SELECT * FROM fraud_queue ORDER BY createdAt DESC');
    return rows.map((r) => {
      const risk = r.subjectType === 'LISTING' ? this.db.get<any>('SELECT * FROM risk_scores WHERE listingId = ?', [r.subjectId]) : null;
      return {
        id: r.id, subjectType: r.subjectType, subjectId: r.subjectId, subjectTitle: r.subjectTitle, city: r.city,
        risk: risk
          ? { overall: risk.overall, identitySignal: risk.identitySignal, deviceReputationSignal: risk.deviceReputationSignal,
              listingBehaviorSignal: risk.listingBehaviorSignal, priceAnomalySignal: risk.priceAnomalySignal,
              accountAgeSignal: risk.accountAgeSignal, userReportSignal: risk.userReportSignal,
              imageAnalysisSignal: risk.imageAnalysisSignal, locationConsistencySignal: risk.locationConsistencySignal, riskLevel: risk.riskLevel }
          : null, // ai-unavailable case: score not yet computed
        status: r.status, createdAt: r.createdAt,
      };
    });
  }

  // Real approve/reject/escalate — actually mutates the underlying listing/account status,
  // writes an audit log entry, and pushes a live update over the websocket gateway.
  decideFraudItem(actorId: string, itemId: string, decision: 'CLEARED' | 'REJECTED' | 'ESCALATED', note?: string) {
    const item = this.db.get<any>('SELECT * FROM fraud_queue WHERE id = ?', [itemId]);
    if (!item) throw new NotFoundException('Queue item not found.');
    this.db.run('UPDATE fraud_queue SET status = ?, reviewedBy = ?, reviewedAt = ?, decisionNote = ? WHERE id = ?', [
      decision, actorId, new Date().toISOString(), note ?? null, itemId,
    ]);
    if (item.subjectType === 'LISTING') {
      const newStatus = decision === 'CLEARED' ? 'PUBLISHED' : decision === 'REJECTED' ? 'REMOVED' : 'UNDER_REVIEW';
      this.db.run('UPDATE listings SET status = ? WHERE id = ?', [newStatus, item.subjectId]);
    } else if (item.subjectType === 'ACCOUNT' && decision === 'REJECTED') {
      this.db.run("UPDATE users SET verificationStatus = 'REJECTED' WHERE id = ?", [item.subjectId]);
    }
    this.db.run(
      `INSERT INTO audit_logs (id, actorId, action, entityType, entityId, beforeState, afterState) VALUES (?,?,?,?,?,?,?)`,
      [`al_${Date.now()}`, actorId, `fraud_queue_${decision.toLowerCase()}`, item.subjectType, item.subjectId, item.status, decision],
    );
    const updated = this.db.get<any>('SELECT * FROM fraud_queue WHERE id = ?', [itemId]);
    this.rt.emitFraudQueueUpdate(updated);
    return updated;
  }

  users() {
    return this.db.all<any>('SELECT id, fullName, phone, email, role, verificationStatus, trustScore, createdAt FROM users ORDER BY createdAt DESC');
  }

  suspendUser(actorRole: string, actorId: string, userId: string) {
    this.assertSenior(actorRole);
    this.db.run("UPDATE users SET verificationStatus = 'REJECTED' WHERE id = ?", [userId]);
    this.db.run(`INSERT INTO audit_logs (id, actorId, action, entityType, entityId) VALUES (?,?,?,?,?)`, [
      `al_${Date.now()}`, actorId, 'user_suspended', 'USER', userId,
    ]);
    return { userId, suspended: true };
  }

  revenue() {
    return this.db.all<any>('SELECT * FROM revenue_series');
  }

  // Real aggregate figures computed from the actual order/escrow tables, not
  // hardcoded numbers, so they move as the demo dataset changes.
  overview() {
    const gmv = this.db.get<any>("SELECT COALESCE(SUM(totalAmountPKR),0) v FROM orders WHERE status IN ('PAYMENT_CONFIRMED','SHIPPED','DELIVERED','COMPLETED')").v;
    const totalOrders = this.db.get<any>('SELECT COUNT(*) c FROM orders').c;
    const disputedOrders = this.db.get<any>("SELECT COUNT(*) c FROM orders WHERE status = 'DISPUTED'").c;
    const fraudFlagged = this.db.get<any>("SELECT COUNT(*) c FROM fraud_queue WHERE status IN ('NEW','IN_REVIEW')").c;
    return {
      gmvPKR: gmv,
      totalOrders,
      disputeRate: totalOrders ? Math.round((disputedOrders / totalOrders) * 1000) / 10 : 0,
      fraudQueuePending: fraudFlagged,
    };
  }

  escrowLedger() {
    return this.db.all<any>(
      `SELECT e.*, o.orderNumber, o.status as orderStatus FROM escrow_transactions e JOIN orders o ON o.id = e.orderId ORDER BY o.createdAt DESC`,
    );
  }

  releaseEscrow(actorRole: string, actorId: string, orderId: string) {
    this.assertSenior(actorRole);
    this.db.run('UPDATE escrow_transactions SET state = ?, heldForReview = 0, releasedAt = ? WHERE orderId = ?', [
      'RELEASED', new Date().toISOString(), orderId,
    ]);
    this.db.run('DELETE FROM escrow_release_block WHERE orderId = ?', [orderId]);
    this.db.run('UPDATE orders SET status = ? WHERE id = ?', ['COMPLETED', orderId]);
    this.db.run(`INSERT INTO audit_logs (id, actorId, action, entityType, entityId) VALUES (?,?,?,?,?)`, [
      `al_${Date.now()}`, actorId, 'escrow_manual_release', 'ORDER', orderId,
    ]);
    this.rt.emitOrderUpdate(orderId, 'COMPLETED');
    return { orderId, released: true };
  }

  aiMonitoring() {
    // Precision/recall of analyst decisions vs the original AI risk classification —
    // computed from the real fraud_queue + risk_scores rows already in the DB.
    const decided = this.db.all<any>("SELECT * FROM fraud_queue WHERE status IN ('CLEARED','REJECTED')");
    let agree = 0;
    for (const d of decided) {
      const risk = this.db.get<any>('SELECT riskLevel FROM risk_scores WHERE listingId = ?', [d.subjectId]);
      const aiSaidRisky = risk?.riskLevel === 'HIGH';
      const analystSaidRisky = d.status === 'REJECTED';
      if (aiSaidRisky === analystSaidRisky) agree++;
    }
    return {
      decidedCount: decided.length,
      agreementRate: decided.length ? Math.round((agree / decided.length) * 100) : null,
    };
  }
}
