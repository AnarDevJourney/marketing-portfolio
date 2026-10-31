import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { UpdateHeroDto } from './dto/update-hero.dto.js';
import { HeroService } from './hero.service.js';

@ApiTags('admin / hero')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/hero')
export class HeroAdminController {
  constructor(private readonly hero: HeroService) {}

  @Get()
  get() {
    return this.hero.get();
  }

  @Put()
  replace(@Body() dto: UpdateHeroDto) {
    return this.hero.replace(dto);
  }
}
