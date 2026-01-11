import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, Min, Max, Matches } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  table: string;

  @IsDateString()
  @IsNotEmpty()
  reservationDate: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'reservationTime must be in HH:MM format' })
  reservationTime: string;

  @IsNumber()
  @Min(1)
  numberOfGuests: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(480)
  duration?: number;
}
