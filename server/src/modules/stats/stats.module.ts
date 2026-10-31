import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContactMessage,
  ContactMessageSchema,
} from '../contact/contact-message.schema.js';
import { Media, MediaSchema } from '../media/media.schema.js';
import { Project, ProjectSchema } from '../projects/project.schema.js';
import { StatsController } from './stats.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactMessage.name, schema: ContactMessageSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
  ],
  controllers: [StatsController],
})
export class StatsModule {}
