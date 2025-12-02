import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from 'src/Application/Controllers/order.controller';
import { OrderService } from 'src/Application/Services/order.service';
import { OrderSchema } from 'src/Data/models/order.schema';
import { reservationSchema } from 'src/Data/models/reservation.schema';
import { tableSchema } from 'src/Data/models/table.schema';
import { MenuItemSchema } from 'src/Data/models/menuitem.schema';
import { PaymentSchema } from 'src/Data/models/payments.schema';
import { AuthModule } from 'src/Application/Modules/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'Reservation', schema: reservationSchema },
      { name: 'Table', schema: tableSchema },
      { name: 'MenuItem', schema: MenuItemSchema },
      { name: 'Payment', schema: PaymentSchema },
    ]),
    AuthModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }
