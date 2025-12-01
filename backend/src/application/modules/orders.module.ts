// orders.module.ts
import { Module , forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../services/order.service';
import { Order, OrderSchema } from '../../data/models/order.schema';
import { OrderItem, OrderItemSchema } from '../../data/models/orderItem.schema';
import { MenuItem, MenuItemSchema } from '../../data/models/menuitem.schema';
import { Payment, PaymentSchema } from '../../data/models/payments.schema';
import { User, UserSchema } from '../../data/models/user.schema';
import { Table, TableSchema } from '../../data/models/table.schema';
import { Reservation, ReservationSchema } from '../../data/models/reservation.schema';
import { ReservationsModule } from './reservations.module';
import { UsersModule } from './users.module';
import { TablesModule } from './tables.module';
import { PaymentsModule } from './payments.module';
import { MenuItemsModule } from './menuitems.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: User.name, schema: UserSchema },
      { name: Table.name, schema: TableSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    forwardRef(() => ReservationsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => TablesModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => MenuItemsModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService, MongooseModule],
})
export class OrdersModule {}
