import { Type } from 'class-transformer';
import {
  IsDefined,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto.js';
import {
  HERO_BACKGROUND_TYPES,
  type HeroBackgroundType,
} from '../hero.schema.js';

/** Section anchor (#contact), site path (/work/x) or http(s) URL. */
export const LINK_PATTERN =
  /^(#[\w-]*|\/[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+)$/;

export class HeroCtaDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  label: LocalizedStringDto;

  @IsString()
  @MaxLength(500)
  @Matches(LINK_PATTERN, {
    message: 'href must be #anchor, /path, http(s):// or mailto: link',
  })
  href: string;
}

export class HeroBackgroundDto {
  @IsIn(HERO_BACKGROUND_TYPES)
  type: HeroBackgroundType;

  @IsOptional() @IsMongoId() media?: string | null;
  @IsOptional() @IsMongoId() poster?: string | null;

  @IsNumber()
  @Min(0)
  @Max(1)
  overlayOpacity: number;
}

/** PUT body: replaces the whole hero section. */
export class UpdateHeroDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  eyebrow?: LocalizedStringDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  title: LocalizedStringDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  subtitle: LocalizedStringDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => HeroCtaDto)
  cta: HeroCtaDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => HeroBackgroundDto)
  background: HeroBackgroundDto;
}
