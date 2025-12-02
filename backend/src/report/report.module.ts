import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportSchema } from '../models/report.schema';
import { OrderSchema } from '../models/order.schema';
import { reservationSchema } from '../models/reservation.schema';
import { FeedbackSchema } from '../models/feedback.schema';
import { AuthModule } from '../auth/auth.module';

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
export class ReportModule {}
