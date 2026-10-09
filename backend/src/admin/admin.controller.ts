import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ok } from '../common/response';
import { AuthGuard } from '../common/auth.guard';

@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private svc: AdminService) {}

  @Get('overview')
  overview(@Req() req: any) { this.svc.assertAdmin(req.user.role); return ok(this.svc.overview()); }

  @Get('fraud-queue')
  fraudQueue(@Req() req: any) { this.svc.assertAdmin(req.user.role); const rows = this.svc.fraudQueue(); return ok(rows, rows.length); }

  @Post('fraud-queue/:id/decide')
  decide(@Req() req: any, @Param('id') id: string, @Body() body: { decision: 'CLEARED' | 'REJECTED' | 'ESCALATED'; note?: string }) {
    this.svc.assertAdmin(req.user.role);
    return ok(this.svc.decideFraudItem(req.user.id, id, body.decision, body.note));
  }

  @Get('users')
  users(@Req() req: any) { this.svc.assertAdmin(req.user.role); const rows = this.svc.users(); return ok(rows, rows.length); }

  @Post('users/:id/suspend')
  suspend(@Req() req: any, @Param('id') id: string) { return ok(this.svc.suspendUser(req.user.role, req.user.id, id)); }

  @Get('revenue')
  revenue(@Req() req: any) { this.svc.assertAdmin(req.user.role); return ok(this.svc.revenue()); }

  @Get('escrow')
  escrow(@Req() req: any) { this.svc.assertAdmin(req.user.role); return ok(this.svc.escrowLedger()); }

  @Post('escrow/:orderId/release')
  release(@Req() req: any, @Param('orderId') orderId: string) { return ok(this.svc.releaseEscrow(req.user.role, req.user.id, orderId)); }

  @Get('ai-monitoring')
  aiMonitoring(@Req() req: any) { this.svc.assertAdmin(req.user.role); return ok(this.svc.aiMonitoring()); }
}
