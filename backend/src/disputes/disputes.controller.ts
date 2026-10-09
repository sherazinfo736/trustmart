import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { ok } from '../common/response';
import { AuthGuard } from '../common/auth.guard';

@Controller()
export class DisputesController {
  constructor(private svc: DisputesService) {}

  @Get('disputes/:id')
  detail(@Param('id') id: string) { return ok(this.svc.detail(id)); }

  @UseGuards(AuthGuard)
  @Get('disputes')
  all() { return ok(this.svc.all()); }

  @UseGuards(AuthGuard)
  @Post('disputes/:id/evidence')
  addEvidence(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return ok(this.svc.addEvidence(id, req.user.id, body));
  }

  @UseGuards(AuthGuard)
  @Post('disputes/:id/decide')
  decide(@Req() req: any, @Param('id') id: string, @Body() body: { decision: 'RELEASE_SELLER' | 'REFUND_BUYER' | 'SPLIT' }) {
    return ok(this.svc.decide(id, req.user.id, body.decision));
  }

  @UseGuards(AuthGuard)
  @Post('disputes/:id/escalate')
  escalate(@Req() req: any, @Param('id') id: string) { return ok(this.svc.escalate(id, req.user.id)); }

  @UseGuards(AuthGuard)
  @Post('scam-reports')
  submitReport(@Req() req: any, @Body() body: any) { return this.svc.submitScamReport(req.user.id, body); }

  @UseGuards(AuthGuard)
  @Get('scam-reports')
  reports() { return ok(this.svc.scamReports()); }
}
