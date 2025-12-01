import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from '../controllers/customer.controller';
import { CustomerService } from '../services/customer.service';
import { Customer, CustomerSchema } from '../../data/models/customer.schema';
import { Reservation, ReservationSchema } from '../../data/models/reservation.schema';
import { Order, OrderSchema } from '../../data/models/order.schema';
import { MenuItem, MenuItemSchema } from '../../data/models/menuitem.schema';
import { Feedback, FeedbackSchema } from '../../data/models/feedback.schema';
import { User, UserSchema } from '../../data/models/user.schema';
import { ReservationsModule } from './reservations.module';
import { OrdersModule } from './orders.module';
import { MenuItemsModule } from './menuitems.module';
import { FeedbackModule } from './feedback.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Feedback.name, schema: FeedbackSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => ReservationsModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => MenuItemsModule),
    forwardRef(() => FeedbackModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService, MongooseModule],
})
export class CustomersModule {}
