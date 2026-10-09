import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { DbService } from '../db/db.service';

/**
 * OTP flow is REAL in the sense that codes are generated, stored, expired,
 * and verified against the database exactly like a production auth flow —
 * the only simulated part is SMS delivery, since that requires a real
 * telecom/SMS-gateway account (e.g. Twilio) this project doesn't have
 * credentials for. The generated code is returned in the API response body
 * ONLY when NODE_ENV !== 'production', clearly under a `devOtp` field, so
 * the frontend can auto-fill it for demos without needing a real SMS.
 */
@Injectable()
export class AuthService {
  constructor(private db: DbService, private jwt: JwtService) {}

  requestOtp(phone: string, purpose: 'LOGIN' | 'SIGNUP' | 'RESET_PASSWORD') {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const user = this.db.get<any>('SELECT * FROM users WHERE phone = ?', [phone]);
    this.db.run(
      `INSERT INTO otp_codes (id, userId, phone, code, purpose, expiresAt) VALUES (?,?,?,?,?,?)`,
      [id, user?.id ?? null, phone, code, purpose, expiresAt],
    );
    const devOtp = process.env.NODE_ENV === 'production' ? undefined : code;
    return { otpId: id, expiresAt, devOtp };
  }

  verifyOtp(otpId: string, code: string, signupInfo?: { fullName: string; phone: string; role: string }) {
    const row = this.db.get<any>('SELECT * FROM otp_codes WHERE id = ?', [otpId]);
    if (!row) throw new BadRequestException('Invalid OTP request.');
    if (row.consumedAt) throw new BadRequestException('This code was already used.');
    if (new Date(row.expiresAt).getTime() < Date.now()) throw new BadRequestException('This code has expired.');
    if (row.code !== code) throw new BadRequestException('Incorrect code.');

    this.db.run('UPDATE otp_codes SET consumedAt = ? WHERE id = ?', [new Date().toISOString(), otpId]);

    let user = this.db.get<any>('SELECT * FROM users WHERE phone = ?', [row.phone]);
    if (!user && signupInfo) {
      const id = `u_${randomUUID().slice(0, 8)}`;
      this.db.run(
        `INSERT INTO users (id, fullName, phone, role, verificationStatus, trustScore, languagePref) VALUES (?,?,?,?,?,?,?)`,
        [id, signupInfo.fullName, signupInfo.phone, signupInfo.role ?? 'BUYER', 'UNVERIFIED', 50, 'en'],
      );
      user = this.db.get<any>('SELECT * FROM users WHERE id = ?', [id]);
    }
    if (!user) throw new BadRequestException('No account found for this number — try signing up.');

    return this.issueSession(user);
  }

  issueSession(user: any) {
    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );
    const refreshToken = randomUUID();
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    this.db.run(`INSERT INTO refresh_tokens (id, userId, tokenHash, expiresAt) VALUES (?,?,?,?)`, [
      id, user.id, refreshToken, expiresAt,
    ]);
    return { accessToken, refreshToken, user: this.publicUser(user) };
  }

  refresh(refreshToken: string) {
    const row = this.db.get<any>('SELECT * FROM refresh_tokens WHERE tokenHash = ?', [refreshToken]);
    if (!row || row.revokedAt || new Date(row.expiresAt).getTime() < Date.now()) {
      throw new UnauthorizedException('Session expired — please log in again.');
    }
    const user = this.db.get<any>('SELECT * FROM users WHERE id = ?', [row.userId]);
    if (!user) throw new UnauthorizedException();
    return this.issueSession(user);
  }

  verifyAccessToken(token: string) {
    try {
      return this.jwt.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid or expired session.');
    }
  }

  me(userId: string) {
    const user = this.db.get<any>('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  private publicUser(u: any) {
    return {
      id: u.id,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl ?? undefined,
      phone: u.phone,
      email: u.email ?? undefined,
      role: u.role,
      verificationStatus: u.verificationStatus,
      trustScore: u.trustScore,
      languagePref: u.languagePref,
      createdAt: u.createdAt,
    };
  }
}
