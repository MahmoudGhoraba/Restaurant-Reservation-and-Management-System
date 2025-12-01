import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TableDocument = HydratedDocument<Table>;

export enum TableLocation {
  WINDOW = 'Window',
  CENTER = 'Center',
  OUTDOOR = 'Outdoor'
}

export enum TableStatus {
  AVAILABLE = 'Available',
  RESERVED = 'Reserved',
  OCCUPIED = 'Occupied'
}

@Schema({ timestamps: true })
export class Table {

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  tableNumber: string;

  @Prop({ required: true, min: 1, max: 20 })
  capacity: number;

  @Prop({
    type: String,
    enum: Object.values(TableLocation),
    required: true
  })
  location: TableLocation;

  @Prop({
    type: String,
    enum: Object.values(TableStatus),
    default: TableStatus.AVAILABLE
  })
  status: TableStatus;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const TableSchema = SchemaFactory.createForClass(Table);