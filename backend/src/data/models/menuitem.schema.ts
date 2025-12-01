import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

export enum MenuCategory {
  APPETIZERS = 'Appetizers',
  MAIN_COURSE = 'Main Course',
  DESSERTS = 'Desserts',
  BEVERAGES = 'Beverages'
}

@Schema({ timestamps: true })
export class MenuItem {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({
    type: String,
    enum: Object.values(MenuCategory),
    required: true
  })
  category: MenuCategory;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: 15 })
  preparationTime: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
