import { IsString, IsNumber, IsOptional, IsDateString, Min, Max, IsMongoId, IsEnum } from 'class-validator';
import { BookingStatus } from '../models/reservation.schema';

export class CreateReservationDto {
  @IsMongoId()
  customer: string;

  @IsMongoId()
  table: string;

  @IsDateString()
  reservationDate: string;

  @IsString()
  reservationTime: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  numberOfGuests: number;

  @IsString()
  @IsOptional()
  specialRequests?: string;
}

export class UpdateReservationDto {
  @IsMongoId()
  @IsOptional()
  table?: string;

  @IsDateString()
  @IsOptional()
  reservationDate?: string;

  @IsString()
  @IsOptional()
  reservationTime?: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  numberOfGuests?: number;

  @IsEnum(BookingStatus)
  @IsOptional()
  bookingStatus?: BookingStatus;

  @IsString()
  @IsOptional()
  specialRequests?: string;

  @IsMongoId()
  @IsOptional()
  assignedStaff?: string;

  @IsMongoId()
  @IsOptional()
  order?: string;
}
