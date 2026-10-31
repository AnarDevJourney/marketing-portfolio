import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service.js';

@ApiTags('public')
@Controller('public/services')
export class ServicesPublicController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  findAll() {
    return this.services.findPublic();
  }
}
