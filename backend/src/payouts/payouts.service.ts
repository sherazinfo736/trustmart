import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class PayoutsService {
  constructor(private db: DbService) {}

  forSeller(sellerId: string) {
    return this.db.all<any>('SELECT * FROM payouts WHERE sellerId = ? ORDER BY createdAt DESC', [sellerId]).map((p) => ({
      id: p.id, sellerId: p.sellerId, escrowTransactionId: p.escrowTransactionId, payoutMethod: p.payoutMethod,
      amountPKR: p.amountPKR, status: p.status, heldReason: p.heldReason ?? undefined, createdAt: p.createdAt,
    }));
  }

  trustScoreTrend(userId: string) {
    return this.db.all<any>('SELECT week, score FROM trust_score_trend WHERE userId = ? ORDER BY week', [userId]);
  }

  buyerTrustScore(userId: string) {
    const u = this.db.get<any>('SELECT * FROM users WHERE id = ?', [userId]);
    // Factor breakdown mirrors the weighted formula documented in the product blueprint
    // (verification, completed orders, on-time confirmation, disputes, account age).
    const completedOrders = this.db.get<any>("SELECT COUNT(*) c FROM orders WHERE buyerId = ? AND status = 'COMPLETED'", [userId]).c;
    const totalOrders = this.db.get<any>('SELECT COUNT(*) c FROM orders WHERE buyerId = ?', [userId]).c;
    const disputesOpened = this.db.get<any>('SELECT COUNT(*) c FROM disputes WHERE openedBy = ?', [userId]).c;
    return {
      score: u?.trustScore ?? 50,
      factors: [
        { label: 'Identity verified', value: u?.verificationStatus === 'VERIFIED' ? 'Yes' : 'No', weight: u?.verificationStatus === 'VERIFIED' ? '+25' : '+0' },
        { label: 'Completed escrow orders', value: String(completedOrders), weight: `+${completedOrders * 6}` },
        { label: 'Disputes opened vs orders', value: `${disputesOpened} of ${totalOrders}`, weight: disputesOpened > 0 ? '-8' : '+0' },
      ],
    };
  }

  notifications(userId: string) {
    return this.db.all<any>('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC', [userId]).map((n) => ({
      ...n, read: !!n.read,
    }));
  }
}
