import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { OrderModule } from './order/order.module';
import { MenuItemModule } from './menuitem/menuitem.module';
import { ReservationModule } from './reservation/reservation.module';
import { TableModule } from './table/table.module';
import { ReportModule } from './report/report.module';
import { DatabaseProvider } from './infrastructure/database/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://localhost:27017/restaurant-management';
        return { uri: dbUrl };
      },
    }),
    AuthModule,
    CustomerModule,
    OrderModule,
    MenuItemModule,
    ReservationModule,
    TableModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseProvider],
})
export class AppModule {}
