import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { reservationSchema } from '../models/reservation.schema';
import { TableModule } from '../table/table.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Reservation', schema: reservationSchema },
    ]),
    TableModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
