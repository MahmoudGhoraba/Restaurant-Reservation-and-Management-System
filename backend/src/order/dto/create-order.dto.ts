import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  menuItem: string;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  subTotal: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  id: string; // customer id

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  payment?: string;

  @IsEnum(['Takeaway', 'DineIn', 'Delivery'])
  @IsOptional()
  orderType?: 'Takeaway' | 'DineIn' | 'Delivery';

  @IsOptional()
  @IsString()
  reservation?: string;

  @IsOptional()
  @IsString()
  table?: string;
}
