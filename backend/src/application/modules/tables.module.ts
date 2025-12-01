import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableController } from '../controllers/table.controller';
import { TableService } from '../services/table.service';
import { Table, TableSchema } from '../../data/models/table.schema';
import { Reservation, ReservationSchema } from '../../data/models/reservation.schema';
import { User, UserSchema } from '../../data/models/user.schema';
import { ReservationsModule } from './reservations.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Table.name, schema: TableSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => ReservationsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [TableController],
  providers: [TableService],
  exports: [TableService],
})
export class TablesModule {}
