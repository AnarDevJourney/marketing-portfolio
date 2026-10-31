import type { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import sharp from 'sharp';
import request from 'supertest';
import type { App } from 'supertest/types.js';
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

  const connection = app.get<Connection>(getConnectionToken());
  await connection.dropDatabase();
  // Dropping the database also drops indexes; rebuild them (unique slug etc.).
  await Promise.all(
    Object.values(connection.models).map((m) => m.createIndexes()),
  );
  await app.get(AuthService).ensureAdmin(ADMIN.email, ADMIN.password);
  return app;
}

/** Boots the app and returns request helpers authenticated as the admin. */
export async function createAdminClient() {
  const app = (await createTestApp()) as INestApplication<App>;
  const http = () => request(app.getHttpServer());
  const { body } = await http().post('/api/auth/login').send(ADMIN);
  const token: string = body.accessToken;
  const auth = <T extends request.Test>(req: T) =>
    req.auth(token, { type: 'bearer' });

  /** Uploads a generated PNG and returns the media document. */
  const uploadImage = async (width = 800, height = 600) => {
    const png = await sharp({
      create: { width, height, channels: 3, background: '#ff5a36' },
    })
      .png()
      .toBuffer();
    const res = await auth(http().post('/api/admin/media'))
      .attach('files', png, 'image.png')
      .expect(201);
    return res.body[0] as { _id: string; url: string };
  };

  const uploadFile = async (
    data: Buffer,
    filename: string,
    contentType: string,
  ) => {
    const res = await auth(http().post('/api/admin/media'))
      .attach('files', data, { filename, contentType })
      .expect(201);
    return res.body[0] as { _id: string; url: string };
  };

  return { app, http, auth, uploadImage, uploadFile };
}

export const ls = (text: string) => ({
  az: `${text} az`,
  en: `${text} en`,
  ru: `${text} ru`,
});
