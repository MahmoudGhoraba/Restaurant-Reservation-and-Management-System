import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FeedbackDocument = HydratedDocument<Feedback>;

export enum ReferenceType {
  ORDER = 'Order',
  RESERVATION = 'Reservation',
  GENERAL = 'General'
}

@Schema({ timestamps: true })
export class Feedback {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customer: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ReferenceType),
    required: true,
    default: ReferenceType.GENERAL
  })
  referenceType: ReferenceType;

  @Prop({ type: Types.ObjectId, required: true })
  referenceId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true })
  comments?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
