import { createAdminClient, ls } from './utils/create-app.js';

describe('Clients, testimonials, services (e2e)', () => {
  let c: Awaited<ReturnType<typeof createAdminClient>>;
  let logo: { _id: string; url: string };

  beforeAll(async () => {
    c = await createAdminClient();
    logo = await c.uploadImage(400, 200);
  });

  afterAll(async () => {
    await c.app.close();
  });

  const cases = [
    {
      route: 'clients',
      make: (name: string, published: boolean) => ({
        name,
        logo: logo._id,
        published,
      }),
      label: (item: { name: string }) => item.name,
      invalid: { name: 'No logo' },
    },
    {
      route: 'testimonials',
      make: (name: string, published: boolean) => ({
        author: name,
        role: ls('CEO'),
        quote: ls('Great work'),
        avatar: logo._id,
        published,
      }),
      label: (item: { author: string }) => item.author,
      invalid: { author: 'No quote', role: ls('CEO') },
    },
    {
      route: 'services',
      make: (name: string, published: boolean) => ({
        title: ls(name),
        description: ls('Desc'),
        icon: 'megaphone',
        published,
      }),
      label: (item: { title: { az: string } }) =>
        item.title.az.replace(' az', ''),
      invalid: { title: ls('Bad icon'), description: ls('x'), icon: '<svg>' },
    },
  ];

  describe.each(cases)('$route', ({ route, make, label, invalid }) => {
    const ids: string[] = [];
    const publicLabels = async () => {
      const { body } = await c.http().get(`/api/public/${route}`).expect(200);
      return body.map(label);
    };

    it('requires auth', () =>
      c.http().post(`/api/admin/${route}`).send(make('A', true)).expect(401));

    it('validates input', () =>
      c
        .auth(c.http().post(`/api/admin/${route}`))
        .send(invalid)
        .expect(400));

    it('CRUD + reorder, public shows only published in order', async () => {
      for (const [name, published] of [
        ['A', true],
        ['B', true],
        ['Hidden', false],
      ] as const) {
        const { body } = await c
          .auth(c.http().post(`/api/admin/${route}`))
          .send(make(name, published))
          .expect(201);
        ids.push(body._id);
      }
      expect(await publicLabels()).toEqual(['A', 'B']);

      await c
        .auth(c.http().patch(`/api/admin/${route}/reorder`))
        .send([
          { id: ids[1], order: 0 },
          { id: ids[0], order: 1 },
        ])
        .expect(200);
      expect(await publicLabels()).toEqual(['B', 'A']);

      await c
        .auth(c.http().patch(`/api/admin/${route}/${ids[2]}`))
        .send({ published: true })
        .expect(200);
      expect(await publicLabels()).toContain('Hidden');

      await c
        .auth(c.http().delete(`/api/admin/${route}/${ids[0]}`))
        .expect(204);
      expect(await publicLabels()).not.toContain('A');
      await c.auth(c.http().get(`/api/admin/${route}/${ids[0]}`)).expect(404);
    });
  });
});
