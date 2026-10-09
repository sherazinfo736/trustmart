import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ok } from '../common/response';
import { AuthGuard } from '../common/auth.guard';

@Controller()
export class OrdersController {
  constructor(private svc: OrdersService) {}

  @Get('checkout/:listingId/quote')
  quote(@Param('listingId') listingId: string) { return ok(this.svc.checkoutQuote(listingId)); }

  @UseGuards(AuthGuard)
  @Post('checkout/:listingId')
  async checkout(@Req() req: any, @Param('listingId') listingId: string, @Body() body: { provider: string }) {
    return ok(await this.svc.checkout(req.user.id, listingId, body.provider));
  }

  @UseGuards(AuthGuard)
  @Get('orders')
  myOrders(@Req() req: any) {
    const rows = req.user.role?.includes('SELLER') ? this.svc.sellerOrders(req.user.id) : this.svc.buyerOrders(req.user.id);
    return ok(rows, rows.length);
  }

  @UseGuards(AuthGuard)
  @Get('seller/orders')
  sellerOrders(@Req() req: any) {
    const rows = this.svc.sellerOrders(req.user.id);
    return ok(rows, rows.length);
  }

  @Get('orders/:id')
  detail(@Param('id') id: string) { return ok(this.svc.orderDetail(id)); }

  @UseGuards(AuthGuard)
  @Post('orders/:id/confirm-receipt')
  confirmReceipt(@Param('id') id: string) { return ok(this.svc.confirmReceipt(id)); }

  @Get('orders/:id/certificate')
  cert(@Param('id') id: string) { return ok(this.svc.certificateForOrder(id)); }

  @UseGuards(AuthGuard)
  @Get('me/certificates')
  myCerts(@Req() req: any) { return ok(this.svc.certificates(req.user.id)); }
}
