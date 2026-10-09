import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { ok } from '../common/response';
import { AuthGuard } from '../common/auth.guard';

@UseGuards(AuthGuard)
@Controller()
export class PayoutsController {
  constructor(private svc: PayoutsService) {}

  @Get('seller/payouts')
  payouts(@Req() req: any) { return ok(this.svc.forSeller(req.user.id)); }

  @Get('seller/trust-trend')
  trend(@Req() req: any) { return ok(this.svc.trustScoreTrend(req.user.id)); }

  @Get('me/trust-score')
  myTrust(@Req() req: any) { return ok(this.svc.buyerTrustScore(req.user.id)); }

  @Get('me/notifications')
  notifications(@Req() req: any) { return ok(this.svc.notifications(req.user.id)); }
}
