import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, ValidateIf, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  menuItem: string; // Only menu item ID - name and price will be fetched from database

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class PlaceOrderDto {
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

  // Reservation ID is required only for DineIn orders
  @ValidateIf(o => o.orderType === 'DineIn')
  @IsString()
  @IsNotEmpty()
  reservationId?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string; // Optional: for delivery orders
}
