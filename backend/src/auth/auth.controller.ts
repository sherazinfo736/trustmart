import { Body, Controller, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ok } from '../common/response';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('otp/request')
  requestOtp(@Body() body: { phone: string; purpose?: 'LOGIN' | 'SIGNUP' | 'RESET_PASSWORD' }) {
    return ok(this.auth.requestOtp(body.phone, body.purpose ?? 'LOGIN'));
  }

  @Post('otp/verify')
  verifyOtp(@Body() body: { otpId: string; code: string; signup?: { fullName: string; phone: string; role: string } }) {
    return ok(this.auth.verifyOtp(body.otpId, body.code, body.signup));
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return ok(this.auth.refresh(body.refreshToken));
  }

  @Post('me')
  me(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();
    const payload = this.auth.verifyAccessToken(token);
    return ok(this.auth.me(payload.sub));
  }
}
