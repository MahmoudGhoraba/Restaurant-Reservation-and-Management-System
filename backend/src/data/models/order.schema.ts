import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OrderItem, OrderItemSchema } from './orderItem.schema';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderType {
  TAKEAWAY = 'Takeaway',
  DINE_IN = 'DineIn',
  DELIVERY = 'Delivery'
}

export enum OrderStatus {
  PENDING = 'Pending',
  PREPARING = 'Preparing',
  READY = 'Ready',
  COMPLETED = 'Completed'
}

@Schema({ timestamps: true })
export class Order {
  _id: Types.ObjectId;

  @Prop({ unique: true, required: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  staff?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(OrderType),
    required: true,
    default: OrderType.TAKEAWAY
  })
  orderType: OrderType;

  @Prop({ type: Types.ObjectId, ref: 'Reservation' })
  reservation?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Table' })
  table?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Prop({ trim: true })
  specialInstructions?: string;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
