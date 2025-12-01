import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User, UserSchema } from './user.schema';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ timestamps: true })
export class Customer extends User {
  @Prop({ default: 0 })
  reservationCount: number;

  @Prop({ default: 0 })
  totalSpent: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);