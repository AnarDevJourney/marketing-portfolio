import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PublicCacheModule } from './common/cache/public-cache.module.js';
import { Env, validateEnv } from './config/env.js';
import { HealthController } from './health.controller.js';
import { AboutModule } from './modules/about/about.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { ContactModule } from './modules/contact/contact.module.js';
import { HeroModule } from './modules/hero/hero.module.js';
import { MediaModule } from './modules/media/media.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { PublicModule } from './modules/public/public.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { StatsModule } from './modules/stats/stats.module.js';
import { TestimonialsModule } from './modules/testimonials/testimonials.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        uri: config.get('MONGO_URI', { infer: true }),
      }),
    }),
    PublicCacheModule,
    // Generous global limit; sensitive routes (login, contact) override it.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    AuthModule,
    MediaModule,
    SettingsModule,
    HeroModule,
    AboutModule,
    ProjectsModule,
    ClientsModule,
    TestimonialsModule,
    ServicesModule,
    ContactModule,
    PublicModule,
    StatsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
