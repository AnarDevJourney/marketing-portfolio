import { createAdminClient } from './utils/create-app.js';

describe('Contact form and messages (e2e)', () => {
  let c: Awaited<ReturnType<typeof createAdminClient>>;

  const message = (extra: object = {}) => ({
    name: 'Leyla',
    email: 'leyla@example.com',
    subject: 'Project',
    message: 'Hello, let us work together.',
    locale: 'az',
    startedAt: Date.now() - 10_000,
    ...extra,
  });
  const messages = async (query = '') =>
    (await c.auth(c.http().get(`/api/admin/messages${query}`)).expect(200))
      .body;

  beforeAll(async () => {
    c = await createAdminClient();
  });

  afterAll(async () => {
    await c.app.close();
  });

  // The contact endpoint allows 3 requests per minute, so this file sends exactly 4.
  it('stores a valid message with request metadata', async () => {
    await c
      .http()
      .post('/api/public/contact')
      .set('User-Agent', 'e2e')
      .send(message())
      .expect(201, { ok: true });
    const { items, total } = await messages();
    expect(total).toBe(1);
    expect(items[0]).toMatchObject({
      name: 'Leyla',
      read: false,
      userAgent: 'e2e',
    });
    expect(items[0].ip).toBeTruthy();
  });

  it('silently drops honeypot and too-fast submissions', async () => {
    await c
      .http()
      .post('/api/public/contact')
      .send(message({ website: 'http://spam' }))
      .expect(201, { ok: true });
    await c
      .http()
      .post('/api/public/contact')
      .send(message({ startedAt: Date.now() }))
      .expect(201, { ok: true });
    expect((await messages()).total).toBe(1);
  });

  it('throttles to 3 submissions per minute', () => {
    return c.http().post('/api/public/contact').send(message()).expect(429);
  });

  it('admin marks messages read, filters, sees stats and deletes', async () => {
    const [msg] = (await messages()).items;
    let stats = (await c.auth(c.http().get('/api/admin/stats')).expect(200))
      .body;
    expect(stats.unreadMessages).toBe(1);

    await c
      .auth(c.http().patch(`/api/admin/messages/${msg._id}`))
      .send({ read: true })
      .expect(200);
    expect((await messages('?read=false')).total).toBe(0);
    expect((await messages('?read=true')).total).toBe(1);

    stats = (await c.auth(c.http().get('/api/admin/stats'))).body;
    expect(stats).toMatchObject({
      unreadMessages: 0,
      projects: { total: 0, published: 0 },
    });

    await c.auth(c.http().delete(`/api/admin/messages/${msg._id}`)).expect(204);
    expect((await messages()).total).toBe(0);
  });
});
