import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto.js';
import { MetricDto } from '../../../common/dto/metric.dto.js';

export class TimelineEntryDto {
  @IsString()
  @MaxLength(40)
  period: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  title: LocalizedStringDto;

  @IsString()
  @MaxLength(120)
  company: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description?: LocalizedStringDto;
}

/** PUT body: replaces the whole about section. */
export class UpdateAboutDto {
  @IsOptional() @IsMongoId() photo?: string | null;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  heading: LocalizedStringDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  bio: LocalizedStringDto;

  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => MetricDto)
  stats: MetricDto[];

  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => TimelineEntryDto)
  timeline: TimelineEntryDto[];

  /** Same shape as timeline (title = degree, company = school). Omitted → cleared. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => TimelineEntryDto)
  education?: TimelineEntryDto[];

  /** Omitted → true. */
  @IsOptional() @IsBoolean() careerVisible?: boolean;

  @IsOptional() @IsMongoId() cv?: string | null;
}
