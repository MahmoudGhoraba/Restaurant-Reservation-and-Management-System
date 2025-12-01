import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database.module';
import { ConfigModule } from '@nestjs/config';
// Import all feature modules
import { UsersModule } from './application/modules/users.module';
import { TablesModule } from './application/modules/tables.module';
import { ReservationsModule } from './application/modules/reservations.module';
import { MenuItemsModule } from './application/modules/menuitems.module';
import { OrdersModule } from './application/modules/orders.module';
import { PaymentsModule } from './application/modules/payments.module';
import { FeedbackModule } from './application/modules/feedback.module';
import { ReportsModule } from './application/modules/reports.module';
import { CustomersModule } from './application/modules/customers.module';
import { AdminModule } from './application/modules/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes process.env available globally
    }),
    DatabaseModule,
    // Feature modules
    UsersModule,
    TablesModule,
    ReservationsModule,
    MenuItemsModule,
    OrdersModule,
    PaymentsModule,
    FeedbackModule,
    ReportsModule,
    CustomersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
