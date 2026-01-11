import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  availability: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  category: string;
}
