import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module.js';
import { SettingsAdminController } from './admin.controller.js';
import { Settings, SettingsSchema } from './settings.schema.js';
import { SettingsService } from './settings.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Settings.name, schema: SettingsSchema },
    ]),
    MediaModule,
  ],
  controllers: [SettingsAdminController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
