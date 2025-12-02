import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from 'src/Application/Controllers/report.controller';
import { ReportService } from 'src/Application/Services/report.service';
import { ReportSchema } from 'src/Data/models/report.schema';
import { OrderSchema } from 'src/Data/models/order.schema';
import { reservationSchema } from 'src/Data/models/reservation.schema';
import { FeedbackSchema } from 'src/Data/models/feedback.schema';
import { AuthModule } from 'src/Application/Modules/auth.module';

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
