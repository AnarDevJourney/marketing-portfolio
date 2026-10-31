import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { ADMIN, createTestApp } from './utils/create-app.js';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects wrong credentials', async () => {
    await http()
      .post('/api/auth/login')
      .send({ email: ADMIN.email, password: 'wrong-password' })
      .expect(401);
    await http()
      .post('/api/auth/login')
      .send({ email: 'nobody@e2e.test', password: ADMIN.password })
      .expect(401);
  });

  it('rejects unknown body fields', () => {
    return http()
      .post('/api/auth/login')
      .send({ ...ADMIN, role: 'root' })
      .expect(400);
  });

  it('logs in, reads /me, changes password and invalidates old tokens', async () => {
    const login = await http().post('/api/auth/login').send(ADMIN).expect(200);
    const token: string = login.body.accessToken;

    await http().get('/api/auth/me').expect(401);
    const me = await http()
      .get('/api/auth/me')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(me.body.email).toBe(ADMIN.email);

    await http()
      .patch('/api/auth/password')
      .auth(token, { type: 'bearer' })
      .send({ currentPassword: 'nope', newPassword: 'new-password-1' })
      .expect(401);

    // Make sure the old token's iat is strictly before the change.
    await new Promise((r) => setTimeout(r, 1100));
    const changed = await http()
      .patch('/api/auth/password')
      .auth(token, { type: 'bearer' })
      .send({ currentPassword: ADMIN.password, newPassword: 'new-password-1' })
      .expect(200);

    await http()
      .get('/api/auth/me')
      .auth(token, { type: 'bearer' })
      .expect(401);
    await http()
      .get('/api/auth/me')
      .auth(changed.body.accessToken, { type: 'bearer' })
      .expect(200);
  });

  it('throttles login to 5 attempts per minute', async () => {
    // Earlier tests already used 4 attempts from this IP.
    const attempt = () =>
      http()
        .post('/api/auth/login')
        .send({ email: ADMIN.email, password: 'wrong-password' });
    await attempt().expect(401);
    await attempt().expect(429);
  });
});
