import { IsNumber, IsString, Min } from 'class-validator';

export class CreateTableDto {
  @IsNumber()
  @Min(1)
  capacity: number;

  @IsString()
  location: string;
}
