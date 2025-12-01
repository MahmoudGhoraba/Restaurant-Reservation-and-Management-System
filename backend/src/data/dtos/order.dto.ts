import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, OrderStatus } from '../models/order.schema';

export class OrderItemDto {
  @IsMongoId()
  menuItem: string;

  @IsString()
  name: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @IsNumber()
  @Type(() => Number)
  subTotal: number;
}

export class CreateOrderDto {
  @IsMongoId()
  customer: string;

  @IsMongoId()
  @IsOptional()
  staff?: string;

  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType;

  @IsMongoId()
  @IsOptional()
  reservation?: string;

  @IsMongoId()
  @IsOptional()
  table?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @IsMongoId()
  createdBy: string;
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @IsMongoId()
  @IsOptional()
  staff?: string;
}
