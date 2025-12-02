import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationController } from '../Controllers/reservation.controller';
import { ReservationService } from '../Services/reservation.service';
import { reservationSchema } from '../../Data/models/reservation.schema';
import { TableModule } from './table.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Reservation', schema: reservationSchema },
    ]),
    TableModule,
    AuthModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule { }
