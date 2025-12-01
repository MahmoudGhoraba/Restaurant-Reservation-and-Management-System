import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min, IsMongoId } from 'class-validator';
import { MenuCategory } from '../models/menuitem.schema';

export class CreateMenuItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(MenuCategory)
  category: MenuCategory;

  @IsNumber()
  @Min(1)
  @IsOptional()
  preparationTime?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsMongoId()
  createdBy: string;
}

export class UpdateMenuItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(MenuCategory)
  @IsOptional()
  category?: MenuCategory;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
  preparationTime?: number;
}
