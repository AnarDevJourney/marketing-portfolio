import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AboutService } from './about.service.js';
import { UpdateAboutDto } from './dto/update-about.dto.js';

@ApiTags('admin / about')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/about')
export class AboutAdminController {
  constructor(private readonly about: AboutService) {}

  @Get()
  get() {
    return this.about.get();
  }

  @Put()
  replace(@Body() dto: UpdateAboutDto) {
    return this.about.replace(dto);
  }
}
