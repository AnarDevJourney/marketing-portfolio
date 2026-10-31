import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module.js';
import { ProjectsAdminController } from './admin.controller.js';
import { Project, ProjectSchema } from './project.schema.js';
import { ProjectsService } from './projects.service.js';
import { ProjectsPublicController } from './public.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    MediaModule,
  ],
  controllers: [ProjectsAdminController, ProjectsPublicController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
