import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from './localized-string.dto.js';

/** A number with optional prefix/suffix, e.g. "+240%" reach or "8+" years. */
export class MetricDto {
  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  prefix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  suffix?: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  label: LocalizedStringDto;
}
