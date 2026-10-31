import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListProjectsDto } from './dto/list-projects.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('public')
@Controller('public/projects')
export class ProjectsPublicController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  findAll(@Query() { featured }: ListProjectsDto) {
    return this.projects.findCards(featured);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.projects.findBySlug(slug);
  }
}
