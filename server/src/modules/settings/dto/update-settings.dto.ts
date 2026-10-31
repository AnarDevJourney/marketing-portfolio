import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto.js';
import { LOCALES, type Locale } from '../../../common/locales.js';
import {
  BODY_FONTS,
  HEADING_FONTS,
  HEX_COLOR,
  SECTION_KEYS,
  SOCIAL_PLATFORMS,
  type BodyFont,
  type HeadingFont,
  type SectionKey,
  type SocialPlatform,
} from '../settings.constants.js';

const hex = { message: '$property must be a hex color like #ff5a36' };

export class ColorsDto {
  @Matches(HEX_COLOR, hex) primary: string;
  @Matches(HEX_COLOR, hex) accent: string;
  @Matches(HEX_COLOR, hex) background: string;
  @Matches(HEX_COLOR, hex) surface: string;
  @Matches(HEX_COLOR, hex) text: string;
}

export class FontsDto {
  @IsIn(HEADING_FONTS) heading: HeadingFont;
  @IsIn(BODY_FONTS) body: BodyFont;
}

export class SocialDto {
  @IsIn(SOCIAL_PLATFORMS) platform: SocialPlatform;

  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  url: string;
}

export class ContactDto {
  @IsEmail() email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ValidateNested()
  @Type(() => LocalizedStringDto)
  location: LocalizedStringDto;
}

export class SectionDto {
  @IsIn(SECTION_KEYS) key: SectionKey;
  @IsBoolean() enabled: boolean;

  @IsInt()
  @Min(0)
  order: number;
}

export class SeoDto {
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  title: LocalizedStringDto;

  @ValidateNested()
  @Type(() => LocalizedStringDto)
  description: LocalizedStringDto;

  @IsOptional()
  @IsMongoId()
  ogImage?: string | null;
}

export class LocalesDto {
  @IsIn(LOCALES) default: Locale;

  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(LOCALES, { each: true })
  enabled: Locale[];
}

export class FeaturesDto {
  @IsBoolean() customCursor: boolean;
  @IsBoolean() preloader: boolean;
  @IsBoolean() smoothScroll: boolean;
}

/**
 * PATCH body: every top-level field is optional; a field that is sent
 * replaces the stored value as a whole. Media fields accept null to clear.
 */
export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  siteName?: string;

  @IsOptional() @IsMongoId() logo?: string | null;
  @IsOptional() @IsMongoId() logoDark?: string | null;
  @IsOptional() @IsMongoId() favicon?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ColorsDto)
  colors?: ColorsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FontsDto)
  font?: FontsDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => SocialDto)
  socials?: SocialDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactDto)
  contact?: ContactDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocalesDto)
  locales?: LocalesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FeaturesDto)
  features?: FeaturesDto;
}
