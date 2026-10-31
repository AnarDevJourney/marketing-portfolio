import type { NestExpressApplication } from '@nestjs/platform-express';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { AuthService } from '../../src/modules/auth/auth.service.js';

export const ADMIN = { email: 'admin@e2e.test', password: 'e2e-password' };

/** Boots the full app on a clean database with one admin user. */
export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();
  configureApp(app);
  await app.init();

  await app.get<Connection>(getConnectionToken()).dropDatabase();
  await app.get(AuthService).ensureAdmin(ADMIN.email, ADMIN.password);
  return app;
}
