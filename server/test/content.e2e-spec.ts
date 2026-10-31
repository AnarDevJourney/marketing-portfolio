import { createAdminClient, ls } from './utils/create-app.js';

describe('Hero, about and bootstrap (e2e)', () => {
  let c: Awaited<ReturnType<typeof createAdminClient>>;

  beforeAll(async () => {
    c = await createAdminClient();
  });

  afterAll(async () => {
    await c.app.close();
  });

  const hero = (background: object) => ({
    title: ls('Title'),
    subtitle: ls('Subtitle'),
    cta: { label: ls('Contact'), href: '#contact' },
    background,
  });

  it('bootstrap returns settings, hero, about and enabled sections in order', async () => {
    const { body } = await c.http().get('/api/public/bootstrap').expect(200);
    expect(body.settings.siteName).toBe('Portfolio');
    expect(body.hero.title.en).toBeTruthy();
    expect(body.about.heading.en).toBe('About me');
    expect(body.sections).toEqual([
      'hero',
      'clients',
      'about',
      'services',
      'work',
      'testimonials',
      'contact',
    ]);
  });

  it('hero: validates media type against background type', async () => {
    const image = await c.uploadImage();
    await c
      .auth(c.http().put('/api/admin/hero'))
      .send(hero({ type: 'video', media: image._id, overlayOpacity: 0.5 }))
      .expect(400);
    await c
      .auth(c.http().put('/api/admin/hero'))
      .send(hero({ type: 'image', media: image._id, overlayOpacity: 2 }))
      .expect(400);
    await c
      .auth(c.http().put('/api/admin/hero'))
      .send({
        ...hero({ type: 'none', overlayOpacity: 0 }),
        cta: { label: ls('x'), href: 'javascript:alert(1)' },
      })
      .expect(400);
  });

  it('hero: PUT replaces the section and refreshes the cached bootstrap', async () => {
    const image = await c.uploadImage();
    await c.http().get('/api/public/bootstrap'); // warm the cache

    const { body } = await c
      .auth(c.http().put('/api/admin/hero'))
      .send(hero({ type: 'image', media: image._id, overlayOpacity: 0.3 }))
      .expect(200);
    expect(body.background.media.url).toBe(image.url);
    expect(body.eyebrow).toBeUndefined();

    const boot = await c.http().get('/api/public/bootstrap').expect(200);
    expect(boot.body.hero.title).toEqual(ls('Title'));
    expect(boot.body.hero.background.media.url).toBe(image.url);
  });

  it('about: saves stats and timeline, CV must be a PDF', async () => {
    const photo = await c.uploadImage();
    const about = {
      photo: photo._id,
      heading: ls('About'),
      bio: ls('**Bio**'),
      stats: [{ value: 8, suffix: '+', label: ls('Years') }],
      timeline: [
        { period: '2020 — 2024', title: ls('Head of SMM'), company: 'Agency' },
      ],
    };
    await c
      .auth(c.http().put('/api/admin/about'))
      .send({ ...about, cv: photo._id })
      .expect(400);

    const pdf = await c.uploadFile(
      Buffer.from('%PDF-1.4\n%%EOF'),
      'cv.pdf',
      'application/pdf',
    );
    const { body } = await c
      .auth(c.http().put('/api/admin/about'))
      .send({ ...about, cv: pdf._id })
      .expect(200);
    expect(body.stats).toEqual(about.stats);
    expect(body.cv.url).toBe(pdf.url);
    expect(body.photo.url).toBe(photo.url);

    const boot = await c.http().get('/api/public/bootstrap');
    expect(boot.body.about.heading).toEqual(ls('About'));
  });

  it('bootstrap hides disabled sections after a settings change', async () => {
    const { body: settings } = await c.auth(
      c.http().get('/api/admin/settings'),
    );
    const sections = settings.sections.map(
      (s: { key: string; order: number }) => ({
        key: s.key,
        order: s.key === 'contact' ? 0 : s.order + 1,
        enabled: s.key !== 'clients',
      }),
    );
    await c
      .auth(c.http().patch('/api/admin/settings'))
      .send({ sections })
      .expect(200);

    const boot = await c.http().get('/api/public/bootstrap');
    expect(boot.body.sections[0]).toBe('contact');
    expect(boot.body.sections).not.toContain('clients');
  });

  it('media used by hero/about cannot be deleted', async () => {
    const { body } = await c.auth(c.http().get('/api/admin/about'));
    const res = await c
      .auth(c.http().delete(`/api/admin/media/${body.cv._id}`))
      .expect(409);
    expect(res.body.usedIn).toEqual([
      expect.objectContaining({ collection: 'about', field: 'cv' }),
    ]);
  });
});
