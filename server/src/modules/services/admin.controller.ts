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
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto.js';
import { ServicesService } from './services.service.js';

@ApiTags('admin / services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/services')
export class ServicesAdminController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  findAll() {
    return this.services.findAll();
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
    return this.services.reorder(items);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.services.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.services.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.services.remove(id);
  }
}
