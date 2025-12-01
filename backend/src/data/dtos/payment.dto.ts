import { IsNumber, IsEnum, IsOptional, IsMongoId, Min, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../models/payments.schema';

export class CreatePaymentDto {
  @IsMongoId()
  @IsOptional()
  order?: string;

  @IsMongoId()
  @IsOptional()
  reservation?: string;

  @IsMongoId()
  customer: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  transactionId?: string;
}
