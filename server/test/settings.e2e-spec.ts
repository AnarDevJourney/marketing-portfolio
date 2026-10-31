import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { ADMIN, createTestApp } from './utils/create-app.js';

describe('Admin settings (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  const http = () => request(app.getHttpServer());
  const get = () =>
    http().get('/api/admin/settings').auth(token, { type: 'bearer' });
  const patch = (body: object) =>
    http()
      .patch('/api/admin/settings')
      .auth(token, { type: 'bearer' })
      .send(body);

  beforeAll(async () => {
    app = await createTestApp();
    const res = await http().post('/api/auth/login').send(ADMIN);
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('requires auth', () => {
    return http().get('/api/admin/settings').expect(401);
  });

  it('returns defaults on first read', async () => {
    const { body } = await get().expect(200);
    expect(body.siteName).toBe('Portfolio');
    expect(body.sections).toHaveLength(7);
    expect(body.locales).toEqual({
      default: 'az',
      enabled: ['az', 'en', 'ru'],
    });
    expect(body.logo).toBeNull();
  });

  it('updates only the fields that are sent', async () => {
    const colors = {
      primary: '#112233',
      accent: '#445566',
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
    };
    const { body } = await patch({ siteName: 'Sheila', colors }).expect(200);
    expect(body.siteName).toBe('Sheila');
    expect(body.colors).toEqual(colors);
    expect(body.font).toEqual({ heading: 'unbounded', body: 'onest' });
  });

  it.each([
    ['bad hex color', { colors: { primary: 'red' } }],
    ['unknown field', { theme: 'dark' }],
    ['unknown font', { font: { heading: 'comic-sans', body: 'inter' } }],
    [
      'missing section',
      { sections: [{ key: 'hero', enabled: true, order: 0 }] },
    ],
    [
      'default locale not enabled',
      { locales: { default: 'ru', enabled: ['az'] } },
    ],
    ['non-existent media', { logo: '64b000000000000000000000' }],
    [
      'javascript url',
      { socials: [{ platform: 'x', url: 'javascript:alert(1)' }] },
    ],
  ])('rejects %s', async (_, body) => {
    await patch(body).expect(400);
  });
});
