import { createAdminClient, ls } from './utils/create-app.js';

describe('Projects (e2e)', () => {
  let c: Awaited<ReturnType<typeof createAdminClient>>;
  let cover: { _id: string; url: string };
  const ids: Record<string, string> = {};

  const project = (slug: string, extra: object = {}) => ({
    slug,
    title: ls(slug),
    client: 'Client',
    category: ls('SMM'),
    year: 2025,
    summary: ls('Summary'),
    challenge: ls('Challenge'),
    solution: ls('Solution'),
    results: [{ value: 240, prefix: '+', suffix: '%', label: ls('Reach') }],
    cover: cover._id,
    published: true,
    ...extra,
  });
  const publicSlugs = async (query = '') => {
    const { body } = await c
      .http()
      .get(`/api/public/projects${query}`)
      .expect(200);
    return body.map((p: { slug: string }) => p.slug);
  };

  beforeAll(async () => {
    c = await createAdminClient();
    cover = await c.uploadImage();
  });

  afterAll(async () => {
    await c.app.close();
  });

  it('requires auth for admin routes', () => {
    return c.http().get('/api/admin/projects').expect(401);
  });

  it('creates projects with auto-incrementing order', async () => {
    for (const [slug, extra] of [
      ['alpha', { featured: true }],
      ['beta', {}],
      ['gamma', {}],
      ['draft', { published: false }],
    ] as const) {
      const { body } = await c
        .auth(c.http().post('/api/admin/projects'))
        .send(project(slug, extra))
        .expect(201);
      ids[slug] = body._id;
      expect(body.cover.url).toBe(cover.url);
    }
    const { body } = await c
      .auth(c.http().get('/api/admin/projects'))
      .expect(200);
    expect(body.map((p: { order: number }) => p.order)).toEqual([0, 1, 2, 3]);
  });

  it.each([
    ['duplicate slug', () => project('alpha'), 409],
    ['invalid slug', () => project('Not Valid!'), 400],
    ['missing cover', () => ({ ...project('x'), cover: undefined }), 400],
    ['video as cover', () => project('y', { coverVideo: cover._id }), 400],
  ])('rejects %s', async (_, body, status) => {
    await c
      .auth(c.http().post('/api/admin/projects'))
      .send(body())
      .expect(status);
  });

  it('public list shows only published projects, featured filter works', async () => {
    expect(await publicSlugs()).toEqual(['alpha', 'beta', 'gamma']);
    expect(await publicSlugs('?featured=true')).toEqual(['alpha']);
    const { body } = await c.http().get('/api/public/projects');
    expect(body[0]).not.toHaveProperty('challenge');
    expect(body[0]).not.toHaveProperty('published');
  });

  it('detail returns the case study with the next project (wrapping)', async () => {
    const beta = await c.http().get('/api/public/projects/beta').expect(200);
    expect(beta.body.challenge).toEqual(ls('Challenge'));
    expect(beta.body.next.slug).toBe('gamma');
    const gamma = await c.http().get('/api/public/projects/gamma').expect(200);
    expect(gamma.body.next.slug).toBe('alpha');
    await c.http().get('/api/public/projects/draft').expect(404);
  });

  it('reorder updates the (cached) public order', async () => {
    await c
      .auth(c.http().patch('/api/admin/projects/reorder'))
      .send([
        { id: ids.gamma, order: 0 },
        { id: ids.alpha, order: 1 },
        { id: ids.beta, order: 2 },
      ])
      .expect(200);
    expect(await publicSlugs()).toEqual(['gamma', 'alpha', 'beta']);
    const beta = await c.http().get('/api/public/projects/beta');
    expect(beta.body.next.slug).toBe('gamma');

    await c
      .auth(c.http().patch('/api/admin/projects/reorder'))
      .send([{ id: '64b000000000000000000000', order: 0 }])
      .expect(400);
    await c
      .auth(c.http().patch('/api/admin/projects/reorder'))
      .send([{ id: ids.alpha, order: -1 }])
      .expect(400);
  });

  it('group: shown on cards; next stays within the group (falls back to all)', async () => {
    // Order now: gamma, alpha, beta (all 'primary' by default).
    await c
      .auth(c.http().patch(`/api/admin/projects/${ids.gamma}`))
      .send({ group: 'secondary' })
      .expect(200);
    await c
      .auth(c.http().patch(`/api/admin/projects/${ids.alpha}`))
      .send({ group: 'events' })
      .expect(400);

    const { body: cards } = await c.http().get('/api/public/projects');
    expect(
      cards.map((p: { slug: string; group: string }) => [p.slug, p.group]),
    ).toEqual([
      ['gamma', 'secondary'],
      ['alpha', 'primary'],
      ['beta', 'primary'],
    ]);

    const beta = await c.http().get('/api/public/projects/beta');
    expect(beta.body.next.slug).toBe('alpha'); // skips gamma (other group)
    const gamma = await c.http().get('/api/public/projects/gamma');
    expect(gamma.body.next.slug).toBe('alpha'); // alone in its group → all
  });

  it('publishing and slug changes show up immediately', async () => {
    await c
      .auth(c.http().patch(`/api/admin/projects/${ids.draft}`))
      .send({ published: true, slug: 'delta' })
      .expect(200);
    expect(await publicSlugs()).toContain('delta');
    await c.http().get('/api/public/projects/delta').expect(200);
  });

  it('cover media in use cannot be deleted; deleting a project works', async () => {
    const res = await c
      .auth(c.http().delete(`/api/admin/media/${cover._id}`))
      .expect(409);
    expect(
      res.body.usedIn.every(
        (u: { collection: string }) => u.collection === 'projects',
      ),
    ).toBe(true);

    await c
      .auth(c.http().delete(`/api/admin/projects/${ids.beta}`))
      .expect(204);
    await c
      .auth(c.http().delete(`/api/admin/projects/${ids.beta}`))
      .expect(404);
    expect(await publicSlugs()).not.toContain('beta');
  });
});
