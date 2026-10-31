import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { MEDIA_KINDS, type MediaKind } from '../media.constants.js';

export class ListMediaDto {
  @IsOptional()
  @IsIn(MEDIA_KINDS)
  type?: MediaKind;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 24;
}
