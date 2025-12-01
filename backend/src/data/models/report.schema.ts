import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;

export enum ReportType {
  SALES = 'Sales',
  RESERVATION = 'Reservation',
  FEEDBACK = 'Feedback'
}

export enum ReportStatus {
  GENERATING = 'Generating',
  COMPLETED = 'Completed',
  FAILED = 'Failed'
}

@Schema({ timestamps: true })
export class Report {
  _id: Types.ObjectId;

  @Prop({ unique: true, required: true })
  reportNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  generatedBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ReportType),
    required: true
  })
  reportType: ReportType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: Object,
    required: true
  })
  dateRange: {
    startDate: Date;
    endDate: Date;
  };

  @Prop({
    type: String,
    enum: Object.values(ReportStatus),
    default: ReportStatus.GENERATING
  })
  status: ReportStatus;

  @Prop({ type: Object })
  content?: {
    summary: Record<string, any>;
    data: any[];
  };

  @Prop()
  generatedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);