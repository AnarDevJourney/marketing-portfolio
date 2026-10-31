import { IsString, MaxLength } from 'class-validator';

export class LocalizedStringDto {
  @IsString()
  @MaxLength(20000)
  az: string;

  @IsString()
  @MaxLength(20000)
  en: string;

  @IsString()
  @MaxLength(20000)
  ru: string;
}
