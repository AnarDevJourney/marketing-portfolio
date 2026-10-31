import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module.js';
import { HeroAdminController } from './admin.controller.js';
import { Hero, HeroSchema } from './hero.schema.js';
import { HeroService } from './hero.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hero.name, schema: HeroSchema }]),
    MediaModule,
  ],
  controllers: [HeroAdminController],
  providers: [HeroService],
  exports: [HeroService],
})
export class HeroModule {}
