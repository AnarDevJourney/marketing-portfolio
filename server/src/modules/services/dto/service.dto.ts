import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsOptional,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto.js';

export class CreateServiceDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  title: LocalizedStringDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description: LocalizedStringDto;

  @Matches(/^[a-z0-9-]+$/, { message: 'icon must be a lucide icon name' })
  @MaxLength(60)
  icon: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
