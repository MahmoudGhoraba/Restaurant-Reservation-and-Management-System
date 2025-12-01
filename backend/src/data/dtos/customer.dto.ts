import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateCustomerDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalSpent?: number;
}
