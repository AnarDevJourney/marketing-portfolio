import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto.js';

export class UpdateMediaDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  alt: LocalizedStringDto;
}
