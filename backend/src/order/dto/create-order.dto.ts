import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  menuItem: string;

  @IsNotEmpty()
  @Min(1)
  quantity: number;

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

  @IsEnum(['Takeaway', 'DineIn', 'Delivery'])
  @IsNotEmpty()
  orderType: 'Takeaway' | 'DineIn' | 'Delivery';

  @IsEnum(['Cash', 'Card', 'Online'])
  @IsNotEmpty()
  paymentType: 'Cash' | 'Card' | 'Online';

  @ValidateIf(o => o.orderType === 'DineIn')
  @IsNotEmpty({ message: 'Reservation ID is required for DineIn orders' })
  @IsString()
  reservationId?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  payment?: string;

  @IsOptional()
  @IsString()
  reservation?: string;

  @IsOptional()
  @IsString()
  table?: string;
}
