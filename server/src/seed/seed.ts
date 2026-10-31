import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { Env } from '../config/env.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { SettingsService } from '../modules/settings/settings.service.js';

/** Creates the admin user (from ADMIN_EMAIL / ADMIN_PASSWORD) and default settings. Safe to re-run. */
async function seed() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const config = app.get(ConfigService<Env, true>);
    const email = config.get('ADMIN_EMAIL', { infer: true });
    const password = config.get('ADMIN_PASSWORD', { infer: true });
    if (!email || !password) {
      throw new Error(
        'Set ADMIN_EMAIL and ADMIN_PASSWORD to seed the admin user',
      );
    }

    const created = await app.get(AuthService).ensureAdmin(email, password);
    logger.log(
      created
        ? `Admin user created: ${email}`
        : 'An admin user already exists — skipped',
    );

    await app.get(SettingsService).ensureDefaults();
    logger.log('Default settings ensured');
  } finally {
    await app.close();
  }
}
await seed();
