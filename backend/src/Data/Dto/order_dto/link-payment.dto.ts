import { IsNotEmpty, IsString } from 'class-validator';

export class LinkPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}
