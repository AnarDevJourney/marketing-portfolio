import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { LocalizedStringDto } from '../../../common/dto/localized-string.dto.js';

export class UpdateMediaDto {
  @ValidateNested()
  @Type(() => LocalizedStringDto)
  alt: LocalizedStringDto;
}
