import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: "MenuItem", required: true })
  menuItem: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 1, max: 50 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ trim: true })
  specialInstructions?: string;

  @Prop({ required: true, min: 0 })
  subTotal: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
