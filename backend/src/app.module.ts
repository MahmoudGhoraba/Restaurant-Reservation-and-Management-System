import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Application/Modules/auth.module';
import { CustomerModule } from './Application/Modules/customer.module';
import { OrderModule } from './Application/Modules/order.module';
import { MenuItemModule } from './Application/Modules/menuitem.module';
import { ReservationModule } from './Application/Modules/reservation.module';
import { TableModule } from './Application/Modules/table.module';
import { ReportModule } from './Application/Modules/report.module';
import { TestController } from './Application/Controllers/test.controller';
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
  controllers: [AppController, TestController],
  providers: [AppService, DatabaseProvider],
})
export class AppModule { }
