import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from '../controllers/report.controller';
import { ReportService } from '../services/report.service';
import { Report, ReportSchema } from '../../data/models/report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService, MongooseModule],
})
export class ReportsModule {}
