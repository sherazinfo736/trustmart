import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { randomUUID } from 'node:crypto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class OrdersService {
  constructor(private db: DbService, private rt: RealtimeGateway) {}

  // Escrow fee is always calculated, never hardcoded per screen — matches the
  // formula documented in the product blueprint: 2.5%, min PKR 50, cap PKR 2,500.
  escrowQuote(pricePKR: number) {
    let escrowFee = Math.round(pricePKR * 0.025);
    escrowFee = Math.max(50, Math.min(2500, escrowFee));
    const processingFee = Math.round(pricePKR * 0.005);
    const verificationFee = 500;
    return { pricePKR, escrowFee, processingFee, verificationFee, totalPKR: pricePKR + escrowFee + processingFee + verificationFee };
  }

  checkoutQuote(listingId: string) {
    const listing = this.db.get<any>('SELECT * FROM listings WHERE id = ?', [listingId]);
    if (!listing) return null;
    return { listing: this.parseListing(listing), quote: this.escrowQuote(listing.pricePKR) };
  }

  private parseListing(row: any) {
    return { id: row.id, publicId: row.publicId, sellerId: row.sellerId, categoryId: row.categoryId, title: row.title, pricePKR: row.pricePKR, city: row.city, status: row.status, riskLevel: row.riskLevel };
  }

  // Creates the order AND a pending payment transaction. In production this is the point
  // where a real JazzCash/Easypaisa/Raast/Card SDK call would be made; here it simulates a
  // provider webhook confirming or failing shortly after, exactly like the real flow shape,
  // just without a live merchant account behind it.
  async checkout(buyerId: string, listingId: string, provider: string) {
    const listing = this.db.get<any>('SELECT * FROM listings WHERE id = ?', [listingId]);
    if (!listing) throw new NotFoundException('Listing not found.');
    const quote = this.escrowQuote(listing.pricePKR);
    const orderId = `o_${randomUUID().slice(0, 8)}`;
    const orderNumber = `TM-ORD-${Math.floor(100000 + Math.random() * 899999)}`;

    this.db.run(
      `INSERT INTO orders (id, orderNumber, listingId, buyerId, sellerId, totalAmountPKR, status) VALUES (?,?,?,?,?,?,?)`,
      [orderId, orderNumber, listingId, buyerId, listing.sellerId, quote.totalPKR, 'PAYMENT_PENDING'],
    );
    const txnRef = `demo_${randomUUID().slice(0, 10)}`;
    this.db.run(
      `INSERT INTO payment_transactions (id, orderId, provider, providerTxnRef, amountPKR, status) VALUES (?,?,?,?,?,?)`,
      [randomUUID(), orderId, provider, txnRef, quote.totalPKR, 'PENDING'],
    );

    // Simulate the provider webhook resolving shortly after (demo-accelerated).
    setTimeout(() => this.resolvePayment(orderId, txnRef, listing, quote), 1500);

    return { orderId, orderNumber, status: 'PAYMENT_PENDING' };
  }

  private resolvePayment(orderId: string, txnRef: string, listing: any, quote: any) {
    const success = true; // deterministic success path for the demo checkout flow
    this.db.run('UPDATE payment_transactions SET status = ? WHERE providerTxnRef = ?', [success ? 'SUCCESS' : 'FAILED', txnRef]);
    if (success) {
      this.db.run('UPDATE orders SET status = ? WHERE id = ?', ['PAYMENT_CONFIRMED', orderId]);
      this.db.run(
        `INSERT INTO escrow_transactions (id, orderId, heldAmountPKR, feeAmountPKR, state, heldForReview) VALUES (?,?,?,?,?,?)`,
        [`esc_${orderId}`, orderId, listing.pricePKR, quote.escrowFee, 'HELD', 0],
      );
    } else {
      this.db.run('UPDATE orders SET status = ? WHERE id = ?', ['CANCELLED', orderId]);
    }
    this.rt.emitOrderUpdate(orderId, success ? 'PAYMENT_CONFIRMED' : 'CANCELLED');
  }

  buyerOrders(buyerId: string) {
    return this.db.all<any>('SELECT * FROM orders WHERE buyerId = ? ORDER BY createdAt DESC', [buyerId]).map((o) => this.parseOrder(o));
  }

  sellerOrders(sellerId: string) {
    return this.db.all<any>('SELECT * FROM orders WHERE sellerId = ? ORDER BY createdAt DESC', [sellerId]).map((o) => this.parseOrder(o));
  }

  private parseOrder(o: any) {
    const listing = this.db.get<any>('SELECT title FROM listings WHERE id = ?', [o.listingId]);
    const seller = this.db.get<any>('SELECT fullName FROM users WHERE id = ?', [o.sellerId]);
    return {
      id: o.id, orderNumber: o.orderNumber, listingId: o.listingId, listingTitle: listing?.title ?? '',
      buyerId: o.buyerId, sellerId: o.sellerId, sellerName: seller?.fullName ?? '', totalAmountPKR: o.totalAmountPKR,
      status: o.status, confirmedReceiptAt: o.confirmedReceiptAt ?? undefined, autoReleaseAt: o.autoReleaseAt ?? undefined, createdAt: o.createdAt,
    };
  }

  orderDetail(orderId: string) {
    const order = this.db.get<any>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return null;
    const escrow = this.db.get<any>('SELECT * FROM escrow_transactions WHERE orderId = ?', [orderId]);
    const listing = this.db.get<any>('SELECT * FROM listings WHERE id = ?', [order.listingId]);
    const seller = this.db.get<any>('SELECT * FROM users WHERE id = ?', [order.sellerId]);
    const dispute = this.db.get<any>('SELECT * FROM disputes WHERE orderId = ?', [orderId]);
    const releaseBlock = this.db.get<any>('SELECT * FROM escrow_release_block WHERE orderId = ?', [orderId]);
    const thread = this.db.get<any>('SELECT * FROM chat_threads WHERE orderId = ?', [orderId]);
    const autoReleased = order.status === 'DELIVERED' && order.autoReleaseAt && new Date(order.autoReleaseAt).getTime() < Date.now();

    return {
      order: this.parseOrder(order),
      escrow: escrow ? { id: escrow.id, orderId: escrow.orderId, heldAmountPKR: escrow.heldAmountPKR, feeAmountPKR: escrow.feeAmountPKR, state: escrow.state, heldForReview: !!escrow.heldForReview, releasedAt: escrow.releasedAt ?? undefined } : null,
      listing: listing ? { id: listing.id, title: listing.title, pricePKR: listing.pricePKR } : null,
      seller: seller ? { id: seller.id, fullName: seller.fullName, trustScore: seller.trustScore } : null,
      dispute: dispute ? { id: dispute.id, status: dispute.status, orderId: dispute.orderId } : null,
      releaseBlock: releaseBlock ? { sellerName: releaseBlock.sellerName, reason: releaseBlock.reason } : null,
      autoReleased: !!autoReleased,
      thread: thread ? { id: thread.id } : null,
    };
  }

  // Real state transition + real escrow release, run inside a DB transaction so the
  // order status and escrow state can never drift out of sync with each other.
  confirmReceipt(orderId: string) {
    const order = this.db.get<any>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) throw new NotFoundException('Order not found.');
    const now = new Date().toISOString();
    this.db.db.exec('BEGIN');
    try {
      this.db.run('UPDATE orders SET status = ?, confirmedReceiptAt = ? WHERE id = ?', ['COMPLETED', now, orderId]);
      this.db.run('UPDATE escrow_transactions SET state = ?, releasedAt = ? WHERE orderId = ?', ['RELEASED', now, orderId]);
      this.db.db.exec('COMMIT');
    } catch (e) {
      this.db.db.exec('ROLLBACK');
      throw e;
    }
    this.rt.emitOrderUpdate(orderId, 'COMPLETED');
    return this.orderDetail(orderId);
  }

  certificateForOrder(orderId: string) {
    return this.db.get<any>('SELECT * FROM digital_certificates WHERE orderId = ?', [orderId]) ?? null;
  }

  certificates(userId: string) {
    return this.db.all<any>(
      `SELECT c.* FROM digital_certificates c JOIN orders o ON o.id = c.orderId WHERE o.buyerId = ? OR o.sellerId = ?`,
      [userId, userId],
    );
  }
}
