import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableService } from '../Services/table.service';
import { TableController } from '../Controllers/table.controller';
import { tableSchema } from '../../Data/models/table.schema';
import { reservationSchema } from '../../Data/models/reservation.schema';
import { AuthModule } from './auth.module';

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
export class TableModule { }
