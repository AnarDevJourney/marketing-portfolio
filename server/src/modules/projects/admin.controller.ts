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
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('admin / projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/projects')
export class ProjectsAdminController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll() {
    return this.projects.findAll();
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
    return this.projects.reorder(items);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.projects.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.projects.remove(id);
  }
}
