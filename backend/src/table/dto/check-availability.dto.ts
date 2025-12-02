import { IsString, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CheckAvailabilityDto {
  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsOptional()
  @IsNumber()
  @Min(15)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;
}
