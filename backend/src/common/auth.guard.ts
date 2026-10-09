import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing session token.');
    const payload = this.auth.verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return true;
  }
}
