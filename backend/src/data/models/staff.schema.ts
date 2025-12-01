import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema'; // assuming Staff extends User
import { HydratedDocument } from 'mongoose';

export type StaffDocument = HydratedDocument<Staff>;

export enum StaffPosition {
  WAITER = 'Waiter',
  CHEF = 'Chef',
  MANAGER = 'Manager',
}

export enum ShiftTime {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  NIGHT = 'Night',
}

@Schema({ timestamps: true })
export class Staff extends User {
  @Prop({ type: String, enum: Object.values(StaffPosition), required: true })
  position: StaffPosition;

  @Prop({ type: String, enum: Object.values(ShiftTime), required: true })
  shiftTime: ShiftTime;

  @Prop({ default: true })
  isAvailable: boolean;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
