import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaAdminController } from './admin.controller.js';
import { Media, MediaSchema } from './media.schema.js';
import { MediaService } from './media.service.js';
import { StorageService } from './storage.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
  ],
  controllers: [MediaAdminController],
  providers: [MediaService, StorageService],
  exports: [MediaService],
})
export class MediaModule {}
