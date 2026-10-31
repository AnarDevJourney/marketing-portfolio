import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto.js';

export class CreateTestimonialDto {
  @IsString()
  @MaxLength(120)
  author: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  role: LocalizedStringDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  company?: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  quote: LocalizedStringDto;

  @IsOptional()
  @IsMongoId()
  avatar?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}
