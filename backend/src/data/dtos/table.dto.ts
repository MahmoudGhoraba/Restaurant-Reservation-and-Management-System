import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { TableLocation, TableStatus } from '../models/table.schema';

export class CreateTableDto {
  @IsString()
  tableNumber: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  capacity: number;

  @IsEnum(TableLocation)
  location: TableLocation;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateTableDto {
  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  capacity?: number;

  @IsEnum(TableLocation)
  @IsOptional()
  location?: TableLocation;

  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
