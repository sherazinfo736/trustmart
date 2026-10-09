import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { OrdersModule } from './orders/orders.module';
import { ChatModule } from './chat/chat.module';
import { DisputesModule } from './disputes/disputes.module';
import { PayoutsModule } from './payouts/payouts.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    DbModule,
    RealtimeModule,
    AuthModule,
    ListingsModule,
    OrdersModule,
    ChatModule,
    DisputesModule,
    PayoutsModule,
    AdminModule,
  ],
})
export class AppModule {}
