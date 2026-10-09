import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { randomUUID } from 'node:crypto';

// Real (if simple) rule-based scam-pattern detector — the same category of
// signals described in the product blueprint's AI Chat Protection feature,
// implemented here as keyword/pattern matching rather than a trained NLP
// model (that would be the FastAPI service's job in the full architecture).
const PATTERNS: Array<{ type: string; test: RegExp }> = [
  { type: 'ADVANCE_PAYMENT', test: /\b(advance|before (shipping|delivery)|hold the (item|car|bike))\b.*\b(pay|send|transfer)\b/i },
  { type: 'ADVANCE_PAYMENT', test: /\bsend\b.*\b(easypaisa|jazzcash|advance)\b/i },
  { type: 'OTP_REQUEST', test: /\botp\b|\bverification code\b|\bshare.*code\b/i },
  { type: 'PHISHING_LINK', test: /https?:\/\/(?!trustmart\.pk)\S+/i },
  { type: 'FAKE_COURIER', test: /courier.*(fee|charge|pay)|pay.*(courier|rider|delivery).*(directly|cash)/i },
];

function detectScamPattern(body: string): string | null {
  for (const p of PATTERNS) if (p.test.test(body)) return p.type;
  return null;
}

@Injectable()
export class ChatService {
  constructor(private db: DbService, private rt: RealtimeGateway) {}

  threadsFor(userId: string) {
    const rows = this.db.all<any>('SELECT * FROM chat_threads WHERE buyerId = ? OR sellerId = ?', [userId, userId]);
    return rows.map((t) => {
      const last = this.db.get<any>('SELECT * FROM chat_messages WHERE threadId = ? ORDER BY createdAt DESC LIMIT 1', [t.id]);
      return {
        id: t.id, listingId: t.listingId, listingTitle: t.listingTitle,
        counterpartName: t.counterpartName, lastMessage: last?.body ?? '', unread: 0,
        hasScamFlag: !!t.hasScamFlag, orderId: t.orderId ?? null,
      };
    });
  }

  messages(threadId: string) {
    return this.db.all<any>('SELECT * FROM chat_messages WHERE threadId = ? ORDER BY createdAt ASC', [threadId]).map((m) => ({
      id: m.id, threadId: m.threadId, senderId: m.senderId, body: m.body,
      scamFlag: !!m.scamFlag, scamPatternType: m.scamPatternType ?? undefined, createdAt: m.createdAt,
    }));
  }

  send(senderId: string, threadId: string, body: string) {
    const patternType = detectScamPattern(body);
    const id = `cm_${randomUUID().slice(0, 8)}`;
    const createdAt = new Date().toISOString();
    this.db.run(
      `INSERT INTO chat_messages (id, threadId, senderId, body, scamFlag, scamPatternType, createdAt) VALUES (?,?,?,?,?,?,?)`,
      [id, threadId, senderId, body, patternType ? 1 : 0, patternType, createdAt],
    );
    if (patternType) this.db.run('UPDATE chat_threads SET hasScamFlag = 1 WHERE id = ?', [threadId]);
    const message = { id, threadId, senderId, body, scamFlag: !!patternType, scamPatternType: patternType ?? undefined, createdAt };
    this.rt.emitChatMessage(threadId, message);
    return message;
  }
}
