import { IsString, IsNumber, IsEnum, IsOptional, Min, Max, IsMongoId } from 'class-validator';
import { ReferenceType } from '../models/feedback.schema';

export class CreateFeedbackDto {
  @IsMongoId()
  customer: string;

  @IsEnum(ReferenceType)
  referenceType: ReferenceType;

  @IsMongoId()
  referenceId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class UpdateFeedbackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comments?: string;
}
