import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsMongoId()
  logo: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  website?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
