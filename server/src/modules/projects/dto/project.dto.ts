import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto.js';
import { MetricDto } from '../../../common/dto/metric.dto.js';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ProjectSeoDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  title?: LocalizedStringDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description?: LocalizedStringDto;
}

export class CreateProjectDto {
  @Matches(SLUG_PATTERN, {
    message: 'slug may contain only lowercase letters, digits and dashes',
  })
  @MaxLength(120)
  slug: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  title: LocalizedStringDto;

  @IsString()
  @MaxLength(120)
  client: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  category: LocalizedStringDto;

  @IsInt()
  @Min(1990)
  @Max(2100)
  year: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  summary: LocalizedStringDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  challenge: LocalizedStringDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  solution: LocalizedStringDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => MetricDto)
  results?: MetricDto[];

  @IsMongoId()
  cover: string;

  @IsOptional()
  @IsMongoId()
  coverVideo?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(60)
  @IsMongoId({ each: true })
  gallery?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectSeoDto)
  seo?: ProjectSeoDto;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
