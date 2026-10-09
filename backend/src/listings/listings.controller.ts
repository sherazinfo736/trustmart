import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ok } from '../common/response';
import { AuthGuard } from '../common/auth.guard';

@Controller()
export class ListingsController {
  constructor(private svc: ListingsService) {}

  @Get('listings')
  browse(@Query() q: any) {
    const rows = this.svc.browse({
      categorySlug: q.categorySlug, query: q.query, verifiedOnly: q.verifiedOnly === 'true',
      condition: q.condition, city: q.city,
      minPrice: q.minPrice ? Number(q.minPrice) : undefined, maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
      sort: q.sort,
    });
    return ok(rows, rows.length);
  }

  @Get('cities')
  cities() { return ok(this.svc.cities()); }

  @Get('categories')
  categories() { return ok(this.svc.categories()); }

  @Get('listings/:id')
  detail(@Param('id') id: string) { return ok(this.svc.detail(id)); }

  @Get('listings/:id/risk')
  risk(@Param('id') id: string) { return ok(this.svc.riskBreakdown(id)); }

  @Get('sellers/:id/profile')
  sellerProfile(@Param('id') id: string) { return ok(this.svc.sellerProfile(id)); }

  @Get('reviews')
  reviews(@Query('sellerId') sellerId?: string) { return ok(this.svc.reviews(sellerId)); }

  @UseGuards(AuthGuard)
  @Get('me/saved-listings')
  saved(@Req() req: any) { return ok(this.svc.savedListings(req.user.id)); }

  @UseGuards(AuthGuard)
  @Post('me/saved-listings/:listingId')
  save(@Req() req: any, @Param('listingId') listingId: string) { return ok(this.svc.saveListing(req.user.id, listingId)); }

  @UseGuards(AuthGuard)
  @Post('me/saved-listings/:listingId/remove')
  unsave(@Req() req: any, @Param('listingId') listingId: string) { return ok(this.svc.unsaveListing(req.user.id, listingId)); }

  @UseGuards(AuthGuard)
  @Get('seller/listings')
  sellerListings(@Req() req: any) { return ok(this.svc.sellerListings(req.user.id)); }

  @UseGuards(AuthGuard)
  @Post('seller/listings')
  create(@Req() req: any, @Body() body: any) { return ok(this.svc.createListing(req.user.id, body)); }
}
