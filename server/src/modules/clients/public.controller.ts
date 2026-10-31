import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service.js';

@ApiTags('public')
@Controller('public/clients')
export class ClientsPublicController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  findAll() {
    return this.clients.findPublic();
  }
}
