import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateTableDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  location?: string;
}
