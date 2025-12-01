import { IsString, IsOptional, IsDateString, IsNumber, Min, Max, Matches } from 'class-validator';

export class UpdateReservationDto {
  @IsOptional()
  @IsString()
  table?: string;

  @IsOptional()
  @IsDateString()
  reservationDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'reservationTime must be in HH:MM format' })
  reservationTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfGuests?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(480)
  duration?: number;
}
