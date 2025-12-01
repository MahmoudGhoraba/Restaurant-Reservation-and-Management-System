import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from '../controllers/admin.controller';
import { AdminService } from '../services/admin.service';
import { Admin, AdminSchema } from '../../data/models/admin.schema';
import { User, UserSchema } from '../../data/models/user.schema';
import { Customer, CustomerSchema } from '../../data/models/customer.schema';
import { Staff, StaffSchema } from '../../data/models/staff.schema';
import { Table, TableSchema } from '../../data/models/table.schema';
import { Reservation, ReservationSchema } from '../../data/models/reservation.schema';
import { Order, OrderSchema } from '../../data/models/order.schema';
import { MenuItem, MenuItemSchema } from '../../data/models/menuitem.schema';
import { Payment, PaymentSchema } from '../../data/models/payments.schema';
import { Feedback, FeedbackSchema } from '../../data/models/feedback.schema';
import { Report, ReportSchema } from '../../data/models/report.schema';
import { UsersModule } from './users.module';
import { TablesModule } from './tables.module';
import { ReservationsModule } from './reservations.module';
import { OrdersModule } from './orders.module';
import { PaymentsModule } from './payments.module';
import { FeedbackModule } from './feedback.module';
import { ReportsModule } from './reports.module';
import { CustomersModule } from './customers.module';
import { MenuItemsModule } from './menuitems.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Table.name, schema: TableSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => TablesModule),
    forwardRef(() => ReservationsModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => FeedbackModule),
    forwardRef(() => ReportsModule),
    forwardRef(() => CustomersModule),
    forwardRef(() => MenuItemsModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService, MongooseModule],
})
export class AdminModule {}
