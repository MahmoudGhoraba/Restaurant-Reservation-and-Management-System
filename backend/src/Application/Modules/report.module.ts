import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportSchema } from '../Data/models/report.schema';
import { OrderSchema } from '../Data/models/order.schema';
import { reservationSchema } from '../Data/models/reservation.schema';
import { FeedbackSchema } from '../Data/models/feedback.schema';
import { AuthModule } from '../Application/Modules/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Report', schema: ReportSchema },
            { name: 'Order', schema: OrderSchema },
            { name: 'Reservation', schema: reservationSchema },
            { name: 'Feedback', schema: FeedbackSchema },
        ]),
        AuthModule,
    ],
    controllers: [ReportController],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportModule { }
