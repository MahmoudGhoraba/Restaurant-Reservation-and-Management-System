import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from '../Controllers/customer.controller';
import { CustomerService } from '../Services/customer.service';
import { MenuItemSchema } from '../../Data/models/menuitem.schema';
import { OrderSchema } from '../../Data/models/order.schema';
import { FeedbackSchema } from '../../Data/models/feedback.schema';
import { reservationSchema } from '../../Data/models/reservation.schema';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MenuItem', schema: MenuItemSchema },
      { name: 'Order', schema: OrderSchema },
      { name: 'Feedback', schema: FeedbackSchema },
      { name: 'Reservation', schema: reservationSchema },
    ]),
    AuthModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule { }
