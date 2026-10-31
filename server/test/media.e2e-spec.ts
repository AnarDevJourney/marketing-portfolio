import type { INestApplication } from '@nestjs/common';
import sharp from 'sharp';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { ADMIN, createTestApp } from './utils/create-app.js';

describe('Admin media (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  const http = () => request(app.getHttpServer());
  const auth = <T extends request.Test>(req: T) =>
    req.auth(token, { type: 'bearer' });

  const png = (width: number, height: number) =>
    sharp({
      create: { width, height, channels: 3, background: '#ff5a36' },
    })
      .png()
      .toBuffer();

  beforeAll(async () => {
    app = await createTestApp();
    const res = await http().post('/api/auth/login').send(ADMIN);
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('uploads an image, generates WebP variants and a blur placeholder', async () => {
    const { body } = await auth(http().post('/api/admin/media'))
      .attach('files', await png(2400, 1200), 'cover.png')
      .expect(201);

    const [media] = body;
    expect(media).toMatchObject({
      type: 'image',
      mimeType: 'image/png',
      width: 2400,
      height: 1200,
    });
    expect(media.key).toMatch(/^images\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.png$/);
    expect(Object.keys(media.variants).sort()).toEqual([
      'w1024',
      'w1920',
      'w480',
    ]);
    expect(media.blurDataUrl).toMatch(/^data:image\/webp;base64,/);

    // Publicly readable straight from MinIO.
    const variant = await fetch(media.variants.w480);
    expect(variant.status).toBe(200);
    expect(variant.headers.get('content-type')).toBe('image/webp');
    const meta = await sharp(
      Buffer.from(await variant.arrayBuffer()),
    ).metadata();
    expect(meta.width).toBe(480);
  });

  it('does not upscale small images', async () => {
    const { body } = await auth(http().post('/api/admin/media'))
      .attach('files', await png(300, 200), 'small.png')
      .expect(201);
    expect(Object.keys(body[0].variants)).toEqual(['w480']);
  });

  it.each([
    [
      'SVG',
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
      'x.svg',
      'image/svg+xml',
    ],
    ['fake PDF', Buffer.from('not a pdf'), 'cv.pdf', 'application/pdf'],
    ['text renamed to png', Buffer.from('hello'), 'x.png', 'image/png'],
    [
      'mismatched extension',
      Buffer.from('%PDF-1.4'),
      'cv.exe',
      'application/pdf',
    ],
  ])('rejects %s', async (_, data, filename, contentType) => {
    await auth(http().post('/api/admin/media'))
      .attach('files', data, { filename, contentType })
      .expect(400);
  });

  it('stores PDFs and lists media by type', async () => {
    await auth(http().post('/api/admin/media'))
      .attach('files', Buffer.from('%PDF-1.4\n%%EOF'), {
        filename: 'cv.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const files = await auth(http().get('/api/admin/media?type=file')).expect(
      200,
    );
    expect(files.body.total).toBe(1);
    expect(files.body.items[0].key).toMatch(/^files\/.*\.pdf$/);

    const page = await auth(
      http().get('/api/admin/media?limit=1&page=2'),
    ).expect(200);
    expect(page.body).toMatchObject({ page: 2, limit: 1 });
    expect(page.body.items).toHaveLength(1);
  });

  it('updates alt text', async () => {
    const list = await auth(http().get('/api/admin/media?type=image&limit=1'));
    const id = list.body.items[0]._id;
    const alt = { az: 'Örtük', en: 'Cover', ru: 'Обложка' };
    const { body } = await auth(http().patch(`/api/admin/media/${id}`))
      .send({ alt })
      .expect(200);
    expect(body.alt).toEqual(alt);
  });

  it('blocks deleting media that is in use, then deletes it once freed', async () => {
    const upload = await auth(http().post('/api/admin/media')).attach(
      'files',
      await png(800, 800),
      'logo.png',
    );
    const media = upload.body[0];

    const settings = await auth(http().patch('/api/admin/settings'))
      .send({ logo: media._id })
      .expect(200);
    expect(settings.body.logo.url).toBe(media.url);

    const conflict = await auth(
      http().delete(`/api/admin/media/${media._id}`),
    ).expect(409);
    expect(conflict.body.usedIn).toEqual([
      expect.objectContaining({ collection: 'settings', field: 'logo' }),
    ]);

    await auth(http().patch('/api/admin/settings'))
      .send({ logo: null })
      .expect(200);
    await auth(http().delete(`/api/admin/media/${media._id}`)).expect(204);
    await auth(http().get(`/api/admin/media/${media._id}`)).expect(404);
    expect((await fetch(media.url)).status).toBe(404);
  });

  it('rejects invalid ids', () => {
    return auth(http().get('/api/admin/media/not-an-id')).expect(400);
  });
});
