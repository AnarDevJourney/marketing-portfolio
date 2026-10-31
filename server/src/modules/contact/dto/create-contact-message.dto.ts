import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LOCALES, type Locale } from '../../../common/locales.js';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message: string;

  @IsIn(LOCALES)
  locale: Locale;

  /** Honeypot: hidden field that humans leave empty. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  /** Epoch ms when the form was rendered; used for the minimum fill time check. */
  @IsInt()
  startedAt: number;
}
