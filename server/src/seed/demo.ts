import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import sharp from 'sharp';
import { AppModule } from '../app.module.js';
import { AboutService } from '../modules/about/about.service.js';
import { ClientsService } from '../modules/clients/clients.service.js';
import { HeroService } from '../modules/hero/hero.service.js';
import { MediaService } from '../modules/media/media.service.js';
import { ProjectsService } from '../modules/projects/projects.service.js';
import { ServicesService } from '../modules/services/services.service.js';
import { SettingsService } from '../modules/settings/settings.service.js';
import { TestimonialsService } from '../modules/testimonials/testimonials.service.js';

/**
 * Fills a development database with demo content (fictional brands) and
 * generated images so every public section has something to show.
 * Skips if projects already exist. Run: npm run seed:demo
 */

type L = { az: string; en: string; ru: string };
const ls = (az: string, en: string, ru: string): L => ({ az, en, ru });

const PALETTES = [
  ['#ff5b2e', '#2a1208'],
  ['#b8a6ff', '#16122e'],
  ['#e8d9b5', '#3a2a14'],
  ['#4fd1a5', '#0b2a22'],
  ['#ff8fb1', '#2e0f1a'],
  ['#7aa7ff', '#0e1a33'],
];

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** Abstract gradient artwork with soft shapes and an optional caption. */
function artwork(w: number, h: number, seed: number, caption = '') {
  const [a, b] = PALETTES[seed % PALETTES.length];
  const r = (n: number) => ((seed * 9301 + n * 49297) % 233280) / 233280;
  const circles = Array.from({ length: 4 }, (_, i) => {
    const cx = Math.round(r(i + 1) * w);
    const cy = Math.round(r(i + 7) * h);
    const rad = Math.round((0.2 + r(i + 3) * 0.4) * Math.min(w, h));
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${i % 2 ? a : b}" opacity="${0.25 + r(i + 5) * 0.4}"/>`;
  }).join('');
  const text = caption
    ? `<text x="${w * 0.06}" y="${h * 0.9}" font-family="sans-serif" font-weight="800" font-size="${Math.round(h * 0.09)}" fill="#f2ede3" opacity="0.92">${esc(caption)}</text>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="${Math.round(Math.min(w, h) * 0.06)}"/></filter></defs>
    <rect width="100%" height="100%" fill="url(#g)"/><g filter="url(#blur)">${circles}</g>${text}</svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer();
}

/** Wordmark logo on a transparent background. */
function logo(name: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="160">
    <text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-weight="800" font-size="56" letter-spacing="-1" fill="#f2ede3">${esc(name)}</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function seedDemo() {
  const logger = new Logger('SeedDemo');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const projects = app.get(ProjectsService);
    if ((await projects.findAll()).length) {
      logger.warn('Projects already exist — demo seed skipped');
      return;
    }
    const media = app.get(MediaService);
    const upload = async (data: Buffer, name: string, mime: string) => {
      const [doc] = await media.upload([
        { originalname: name, mimetype: mime, size: data.length, buffer: data },
      ]);
      return doc._id.toString();
    };
    const image = (w: number, h: number, seed: number, caption = '') =>
      artwork(w, h, seed, caption).then((b) =>
        upload(b, `demo-${seed}.jpg`, 'image/jpeg'),
      );

    // Settings + hero
    const settings = app.get(SettingsService);
    await settings.update({
      socials: [
        { platform: 'instagram', url: 'https://instagram.com/' },
        { platform: 'linkedin', url: 'https://linkedin.com/' },
        { platform: 'behance', url: 'https://behance.net/' },
      ],
    });
    const hero = await app.get(HeroService).get();
    await app.get(HeroService).replace({
      eyebrow: hero.eyebrow,
      title: hero.title,
      subtitle: ls(
        'Strategiya, kontent və performans marketinqi ilə brendlərin səsini eşidilən edirəm.',
        'Strategy, content and performance marketing that make brands impossible to ignore.',
        'Стратегия, контент и performance-маркетинг, которые делают бренды заметными.',
      ),
      cta: hero.cta,
      background: { type: 'none', overlayOpacity: 0.4 },
    });

    // About
    await app.get(AboutService).replace({
      photo: await image(1200, 1500, 2),
      heading: ls(
        'Rəqəmlərlə danışan *marketinq*',
        'Marketing that speaks in *numbers*',
        'Маркетинг, который говорит *цифрами*',
      ),
      bio: ls(
        'Səkkiz ildir ki, brendlərin **auditoriyası ilə danışmasına** kömək edirəm — strategiyadan tutmuş son kreativə qədər.\n\nHər kampaniyanı ölçülə bilən məqsədlə başlayıram və nəticələri *şəffaf* göstərirəm.',
        'For eight years I have helped brands **talk with their audience** — from strategy to the final creative.\n\nEvery campaign starts with a measurable goal, and results are reported *transparently*.',
        'Восемь лет я помогаю брендам **говорить со своей аудиторией** — от стратегии до финального креатива.\n\nКаждая кампания начинается с измеримой цели, а результаты я показываю *прозрачно*.',
      ),
      stats: [
        {
          value: 8,
          suffix: '+',
          label: ls('il təcrübə', 'years of experience', 'лет опыта'),
        },
        {
          value: 120,
          suffix: '+',
          label: ls('kampaniya', 'campaigns', 'кампаний'),
        },
        { value: 40, suffix: '+', label: ls('brend', 'brands', 'брендов') },
        {
          value: 5.2,
          suffix: 'x',
          label: ls('orta ROAS', 'average ROAS', 'средний ROAS'),
        },
      ],
      timeline: [
        {
          period: '2023 — indi',
          company: 'Freelance',
          title: ls(
            'Marketinq strateqi',
            'Marketing strategist',
            'Маркетинг-стратег',
          ),
        },
        {
          period: '2020 — 2023',
          company: 'Nomad Studio',
          title: ls('SMM rəhbəri', 'Head of SMM', 'Руководитель SMM'),
        },
        {
          period: '2018 — 2020',
          company: 'Pixelfarm',
          title: ls(
            'Performance marketoloq',
            'Performance marketer',
            'Performance-маркетолог',
          ),
        },
        {
          period: '2017 — 2018',
          company: 'Arcadia',
          title: ls('Kontent menecer', 'Content manager', 'Контент-менеджер'),
        },
      ],
    });

    // Services
    const services = app.get(ServicesService);
    const serviceData: [string, L, L][] = [
      [
        'compass',
        ls('Strategiya', 'Strategy', 'Стратегия'),
        ls(
          'Bazar və auditoriya analizi, mövqeləndirmə, kanal planı və ölçülə bilən KPI-lar.',
          'Market and audience research, positioning, channel plans and measurable KPIs.',
          'Анализ рынка и аудитории, позиционирование, медиаплан и измеримые KPI.',
        ),
      ],
      [
        'megaphone',
        ls('SMM', 'Social media', 'SMM'),
        ls(
          'Kontent planı, icma idarəçiliyi, influenser əməkdaşlıqları və trend əsaslı kreativ.',
          'Content plans, community management, creator partnerships and trend-led creative.',
          'Контент-план, комьюнити-менеджмент, работа с инфлюенсерами и трендовый креатив.',
        ),
      ],
      [
        'trending-up',
        ls('Performance', 'Performance', 'Performance'),
        ls(
          'Meta, Google və TikTok reklamları, A/B testlər və büdcənin ROAS-a görə optimallaşdırılması.',
          'Meta, Google and TikTok ads, A/B testing and budget optimisation for ROAS.',
          'Реклама в Meta, Google и TikTok, A/B-тесты и оптимизация бюджета по ROAS.',
        ),
      ],
      [
        'palette',
        ls('Brend və kontent', 'Brand & content', 'Бренд и контент'),
        ls(
          'Brend səsi, vizual dil, foto və video çəkilişlərin art-direksiyası.',
          'Brand voice, visual language and art direction for photo and video shoots.',
          'Голос бренда, визуальный язык и арт-дирекшн фото- и видеосъёмок.',
        ),
      ],
    ];
    for (const [icon, title, description] of serviceData) {
      await services.create({ icon, title, description, published: true });
    }

    // Clients
    const clients = app.get(ClientsService);
    for (const name of [
      'Lumo',
      'Bloomline',
      'Orbita',
      'Velora',
      'Nomad',
      'Pixelfarm',
      'Arcadia',
      'Kinetik',
    ]) {
      const id = await upload(await logo(name), `${name}.png`, 'image/png');
      await clients.create({ name, logo: id, published: true });
    }

    // Testimonials
    const testimonials = app.get(TestimonialsService);
    const quotes: [string, L, string, L][] = [
      [
        'Aysel Məmmədova',
        ls(
          'Marketinq direktoru',
          'Marketing director',
          'Директор по маркетингу',
        ),
        'Lumo Coffee',
        ls(
          'Rebrendinqdən sonra satışlarımız üç ayda 38% artdı. Ən çox xoşuma gələn isə hər addımın rəqəmlərlə izah olunması idi.',
          'Sales grew 38% in three months after the rebrand. What I valued most was that every step was explained with numbers.',
          'После ребрендинга продажи выросли на 38% за три месяца. Больше всего я ценю, что каждый шаг объяснялся цифрами.',
        ),
      ],
      [
        'Murad Əliyev',
        ls('Təsisçi', 'Founder', 'Основатель'),
        'Caspian Run Club',
        ls(
          'İcmamızı sıfırdan 12 min nəfərlik hərəkata çevirdik. Yaradıcı, sürətli və həmişə bir addım öndə.',
          'We grew our community from zero into a 12,000-strong movement. Creative, fast and always one step ahead.',
          'Мы выросли с нуля до движения в 12 000 человек. Креативно, быстро и всегда на шаг впереди.',
        ),
      ],
      [
        'Leyla Hüseynova',
        ls('Brend menecer', 'Brand manager', 'Бренд-менеджер'),
        'Velora',
        ls(
          'Influenser kampaniyası gözləntilərimizi iki dəfə üstələdi. Komanda ilə işləmək çox rahat idi.',
          'The creator campaign beat our expectations twice over. Working together was effortless.',
          'Кампания с инфлюенсерами превзошла ожидания вдвое. Работать вместе было очень легко.',
        ),
      ],
    ];
    for (const [i, [author, role, company, quote]] of quotes.entries()) {
      const avatar = await image(400, 400, i + 3);
      await testimonials.create({
        author,
        role,
        company,
        quote,
        avatar,
        published: true,
      });
    }

    // Projects
    const projectData = [
      {
        slug: 'lumo-coffee-rebrand',
        client: 'Lumo Coffee',
        year: 2025,
        featured: true,
        title: ls(
          'Lumo Coffee rebrendinqi',
          'Lumo Coffee rebrand',
          'Ребрендинг Lumo Coffee',
        ),
        category: ls('Brend', 'Brand', 'Бренд'),
        summary: ls(
          'Yerli kofe şəbəkəsi üçün yeni səs, vizual dil və lansman kampaniyası.',
          'A new voice, visual language and launch campaign for a local coffee chain.',
          'Новый голос, визуальный язык и запуск кампании для локальной сети кофеен.',
        ),
        results: [
          [240, '+', '%', ls('əhatə', 'reach', 'охват')],
          [3.1, '', 'x', ls('engagement', 'engagement', 'вовлечённость')],
          [38, '+', '%', ls('satış', 'sales', 'продажи')],
        ],
      },
      {
        slug: 'caspian-run-club',
        client: 'Caspian Run Club',
        year: 2024,
        featured: true,
        title: ls(
          'Caspian Run icması',
          'Caspian Run community',
          'Сообщество Caspian Run',
        ),
        category: ls('SMM / İcma', 'Social / Community', 'SMM / Комьюнити'),
        summary: ls(
          'Qaçış klubunu şəhərin ən aktiv idman icmasına çevirən sosial media strategiyası.',
          'A social strategy that turned a running club into the city’s most active sports community.',
          'Стратегия, превратившая беговой клуб в самое активное спортивное сообщество города.',
        ),
        results: [
          [12, '', 'k', ls('iştirakçı', 'participants', 'участников')],
          [180, '+', '%', ls('izləyici', 'followers', 'подписчиков')],
          [2.4, '', 'M', ls('baxış', 'views', 'просмотров')],
        ],
      },
      {
        slug: 'orbita-launch',
        client: 'Orbita Tech',
        year: 2025,
        featured: true,
        title: ls(
          'Orbita məhsul lansmanı',
          'Orbita product launch',
          'Запуск продукта Orbita',
        ),
        category: ls('Performance', 'Performance', 'Performance'),
        summary: ls(
          'SaaS məhsulu üçün çoxkanallı performance kampaniyası və lead funnel.',
          'A multi-channel performance campaign and lead funnel for a SaaS product.',
          'Многоканальная performance-кампания и воронка лидов для SaaS-продукта.',
        ),
        results: [
          [5.2, '', 'x', ls('ROAS', 'ROAS', 'ROAS')],
          [42, '−', '%', ls('CPA', 'CPA', 'CPA')],
          [9.8, '', 'k', ls('lead', 'leads', 'лидов')],
        ],
      },
      {
        slug: 'velora-creators',
        client: 'Velora Skincare',
        year: 2024,
        featured: true,
        title: ls(
          'Velora × kreatorlar',
          'Velora × creators',
          'Velora × креаторы',
        ),
        category: ls('Influenser', 'Influencer', 'Инфлюенсеры'),
        summary: ls(
          '64 kreatorla qurulan, satışa yönəlmiş influenser kampaniyası.',
          'A sales-driven influencer campaign built with 64 creators.',
          'Инфлюенсер-кампания с фокусом на продажи и 64 креаторами.',
        ),
        results: [
          [64, '', '', ls('kreator', 'creators', 'креатора')],
          [18, '', 'M', ls('göstərim', 'impressions', 'показов')],
          [52, '+', '%', ls('satış', 'sales', 'продажи')],
        ],
      },
      {
        slug: 'bloomline-content',
        client: 'Bloomline',
        year: 2023,
        featured: false,
        title: ls(
          'Bloomline kontent sistemi',
          'Bloomline content system',
          'Контент-система Bloomline',
        ),
        category: ls('Kontent', 'Content', 'Контент'),
        summary: ls(
          'Gül brendi üçün mövsümi kontent sistemi və foto çəkilişlərin art-direksiyası.',
          'A seasonal content system and photo art direction for a flower brand.',
          'Сезонная контент-система и арт-дирекшн съёмок для цветочного бренда.',
        ),
        results: [
          [3, '', 'x', ls('saxlama', 'saves', 'сохранений')],
          [65, '+', '%', ls('sifariş', 'orders', 'заказов')],
        ],
      },
    ];
    for (const [i, p] of projectData.entries()) {
      const cover = await image(1600, 1100, i, p.client);
      const gallery = [];
      for (const [j, [w, h]] of [
        [1400, 1000],
        [1000, 1300],
        [1400, 900],
        [1000, 1000],
      ].entries()) {
        gallery.push(await image(w, h, i * 7 + j + 1));
      }
      await projects.create({
        slug: p.slug,
        title: p.title,
        client: p.client,
        category: p.category,
        year: p.year,
        summary: p.summary,
        challenge: ls(
          `${p.client} güclü məhsula sahib idi, amma auditoriya onu tanımırdı. Rəqabət sıx idi və mesaj dağınıq görünürdü.`,
          `${p.client} had a strong product, but the audience didn’t know it. Competition was fierce and the message felt scattered.`,
          `У ${p.client} был сильный продукт, но аудитория о нём не знала. Конкуренция высокая, а сообщение размыто.`,
        ),
        solution: ls(
          'Auditoriya araşdırması ilə başladıq, bir aydın mesaj seçdik və onu hər kanalda ardıcıl danışdıq. Hər həftə nəticələri ölçüb büdcəni ən yaxşı işləyən kreativlərə yönəltdik.',
          'We started with audience research, picked one clear message and told it consistently across every channel. Each week we measured results and moved budget to the best-performing creative.',
          'Мы начали с исследования аудитории, выбрали одно ясное сообщение и последовательно транслировали его во всех каналах. Каждую неделю измеряли результаты и перераспределяли бюджет в пользу лучших креативов.',
        ),
        results: p.results.map(([value, prefix, suffix, label]) => ({
          value: value as number,
          prefix: (prefix as string) || undefined,
          suffix: (suffix as string) || undefined,
          label: label as L,
        })),
        cover,
        gallery,
        tags: [p.category.en],
        featured: p.featured,
        published: true,
      });
    }

    logger.log('Demo content created');
  } finally {
    await app.close();
  }
}
await seedDemo();
