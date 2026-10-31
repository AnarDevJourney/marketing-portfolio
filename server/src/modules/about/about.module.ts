import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module.js';
import { About, AboutSchema } from './about.schema.js';
import { AboutAdminController } from './admin.controller.js';
import { AboutService } from './about.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: About.name, schema: AboutSchema }]),
    MediaModule,
  ],
  controllers: [AboutAdminController],
  providers: [AboutService],
  exports: [AboutService],
})
export class AboutModule {}
