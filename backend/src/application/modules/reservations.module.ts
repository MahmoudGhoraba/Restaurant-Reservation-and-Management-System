import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationController } from '../controllers/reservation.controller';
import { ReservationService } from '../services/reservation.service';
import { Reservation, ReservationSchema } from '../../data/models/reservation.schema';
import { Table, TableSchema } from '../../data/models/table.schema';
import { User, UserSchema } from '../../data/models/user.schema';
import { TablesModule } from './tables.module';
import { OrdersModule } from './orders.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Table.name, schema: TableSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => TablesModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationsModule {}
