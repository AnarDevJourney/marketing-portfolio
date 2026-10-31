import { Module } from '@nestjs/common';
import { AboutModule } from '../about/about.module.js';
import { HeroModule } from '../hero/hero.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { PublicController } from './public.controller.js';

@Module({
  imports: [SettingsModule, HeroModule, AboutModule],
  controllers: [PublicController],
})
export class PublicModule {}
