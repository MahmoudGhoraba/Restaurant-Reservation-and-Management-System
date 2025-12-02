import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['Pending', 'Preparing', 'Served', 'Completed'])
  @IsNotEmpty()
  status: 'Pending' | 'Preparing' | 'Served' | 'Completed';
}
