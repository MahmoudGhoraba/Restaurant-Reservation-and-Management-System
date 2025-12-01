import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableService } from './table.service';
import { tableSchema } from '../models/table.schema';
import { reservationSchema } from '../models/reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Table', schema: tableSchema },
      { name: 'Reservation', schema: reservationSchema },
    ]),
  ],
  providers: [TableService],
  exports: [TableService],
})
export class TableModule {}
