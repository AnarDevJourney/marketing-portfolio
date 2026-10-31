import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ReorderItemDto } from '../../common/dto/reorder.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto.js';
import { ClientsService } from './clients.service.js';

@ApiTags('admin / clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/clients')
export class ClientsAdminController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  findAll() {
    return this.clients.findAll();
  }

  // Declared before ':id' routes so "reorder" isn't parsed as an id.
  @Patch('reorder')
  @ApiBody({ type: [ReorderItemDto] })
  reorder(
    @Body(
      new ParseArrayPipe({
        items: ReorderItemDto,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    items: ReorderItemDto[],
  ) {
    return this.clients.reorder(items);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.clients.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clients.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clients.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.clients.remove(id);
  }
}
