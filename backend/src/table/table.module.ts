import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { tableSchema } from '../models/table.schema';
import { reservationSchema } from '../models/reservation.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Table', schema: tableSchema },
      { name: 'Reservation', schema: reservationSchema },
    ]),
    AuthModule,
  ],
  controllers: [TableController],
  providers: [TableService],
  exports: [TableService],
})
export class TableModule {}
