# Marketing Portfolio Website — Texniki spesifikasiya

> Texniki spesifikasiya və arxitektura sənədi · v1.0 · 31 oktyabr 2026 · Hazırlayan: Anar Talibov
> Mənbə: `Marketing_Portfolio_Spec.pdf`

| | |
|---|---|
| **Stack** | React + Vite · NestJS · MongoDB · MinIO |
| **Deploy** | Netlify (client) · Hetzner VPS (API, Docker Compose) |

## Mündəricat

1. Layihə haqqında
2. Tech stack
3. Ümumi arxitektura
4. Repo strukturu
5. Data modeli (Mongoose schema-ları)
6. API endpoint-ləri
7. Backend detalları
8. Frontend: public sayt
9. Animasiya planı
10. Theming, şriftlər və i18n
11. Admin panel
12. SEO, performans və a11y
13. Təhlükəsizlik
14. Deploy
15. Mərhələli icra planı
16. Claude Code üçün qeydlər

---

## 01 Layihə haqqında

Marketinq sahəsində çalışan bir şəxs üçün şəxsi portfolio saytı. Saytın əsas dəyəri vizual təəssüratdır: baxımlı dizayn, axıcı animasiyalar, müasir və fərqli görünüş. Arxasında kiçik bir admin panel durur ki, sayt sahibi kod yazmadan məzmunu (şəkil, video, case study-lər, rənglər) idarə edə bilsin.

### Əsas prinsiplər

- **UI/UX prioritetdir.** Vaxtın böyük hissəsi public saytın dizaynına, animasiyalarına və hissiyyatına gedir.
- **Overengineering yoxdur.** Bir NestJS API, bir MongoDB, bir MinIO. Mikroservis, Kafka, Redis, queue lazım deyil.
- **Admin sadə, amma kifayət qədər güclü olmalıdır.** Sayt sahibi texniki adam deyil; hər şey formalarla, aydın etiketlərlə idarə olunur.
- **Performans dizaynın bir hissəsidir.** Ağır animasiyalar və videolar olsa da, sayt sürətli açılmalıdır (Lighthouse 90+ hədəfi).
- **Çoxdillilik:** AZ / EN / RU.

### Əhatə dairəsi (scope)

| Daxildir | Daxil deyil |
|---|---|
| Bir səhifəlik ana səhifə (bölmələrlə) + case study detal səhifələri | Blog / CMS-in tam funksionallığı |
| Admin panel: məzmun, media, rənglər, bölmələr, SEO, mesajlar | Çoxlu admin user, rollar, icazələr |
| Kontakt forması + admində mesajlar | Ödəniş, e-commerce, istifadəçi qeydiyyatı |
| AZ / EN / RU | Analytics dashboard (xarici alət ilə həll olunur) |

---

## 02 Tech stack

### Frontend (client)

| Texnologiya | Rolu |
|---|---|
| React + Vite + TypeScript | SPA, sürətli dev server və build |
| React Router | Public route-lar və /admin route-ları; admin `lazy()` ilə ayrı chunk |
| Tailwind CSS | Stil sistemi; rənglər CSS variable-lardan oxunur (`var(--primary)`) |
| Motion (Framer Motion) | Komponent animasiyaları, AnimatePresence ilə page transition, hover/tap effektləri, layoutId |
| GSAP + ScrollTrigger | Scroll-a bağlı ağır animasiyalar: pin, horizontal scroll, scrub, text reveal |
| Lenis | Smooth scroll; GSAP ticker ilə sinxronlaşdırılır |
| Redux Toolkit + RTK Query | API çağırışları, cache, admin mutation-ları |
| Ant Design | Yalnız admin panel (formlar, cədvəllər, upload, color picker) |
| react-i18next | Statik UI mətnləri üçün tərcümə |
| react-helmet-async | Səhifə səviyyəsində meta tag-lar |
| @fontsource/* | Self-hosted şriftlər (admində seçilən 2–3 variant) |
| @dnd-kit | Admində drag-and-drop sıralama |

### Backend (server)

| Texnologiya | Rolu |
|---|---|
| NestJS + TypeScript | REST API, modul əsaslı struktur |
| Mongoose + MongoDB 7 | Data saxlanması |
| MinIO | Şəkil və video faylları (S3-compatible) |
| @nestjs/jwt + Passport | Tək admin üçün JWT auth |
| argon2 (və ya bcrypt) | Parol hash-i |
| class-validator / class-transformer | DTO validasiyası |
| Multer + sharp | Upload; şəkilləri WebP-ə çevirmək və ölçülərə bölmək |
| @nestjs/cache-manager | Public endpoint-lər üçün in-memory cache |
| @nestjs/throttler | Rate limiting (login, kontakt forması) |
| helmet | HTTP security header-ləri |
| nodemailer (opsional) | Yeni kontakt mesajında email bildirişi |

### İnfrastruktur

| Komponent | Harada |
|---|---|
| Client (statik build) | Netlify (CDN) |
| API + MongoDB + MinIO + Caddy | Hetzner VPS, Docker Compose |
| HTTPS | Caddy (Let's Encrypt avtomatik) |
| Backup | mongodump + MinIO mirror, cron ilə gündəlik |

---

## 03 Ümumi arxitektura

```
                    ┌──────────────────────────────┐
 Ziyarətçi ───────▶ │ Netlify CDN                  │
 Admin     ───────▶ │ React SPA (domain.az)        │
                    │   ├─ /          public       │
                    │   └─ /admin/*   lazy chunk   │
                    └──────────────┬───────────────┘
                                   │ HTTPS (JSON)
                                   ▼
       Hetzner VPS ──────────────────────────────────────────
       ┌───────────────────────────────────────────────────┐
       │ Caddy (reverse proxy + TLS)                       │
       │   api.domain.az   ─▶ api:3000   (NestJS)          │
       │   media.domain.az ─▶ minio:9000 (public bucket)   │
       └───────────────────────────────────────────────────┘
             │                          │
             ▼                          ▼
       ┌──────────┐             ┌──────────────┐
       │ MongoDB  │             │ MinIO        │
       │ (daxili) │             │ bucket:media │
       └──────────┘             └──────────────┘
```

### Data axını

- **Public oxuma:** SPA açılanda `GET /api/public/bootstrap` çağırılır (settings + hero + about + bölmələrin siyahısı bir sorğuda). Qalan bölmələr öz endpoint-ləri ilə yüklənir. Backend bu cavabları in-memory cache-dən verir.
- **Media:** fayllar backend üzərindən MinIO-ya yüklənir. Public saytda brauzer şəkilləri birbaşa `media.domain.az`-dan alır, API-dən keçmir.
- **Admin yazma:** `/api/admin/*` endpoint-ləri JWT ilə qorunur. Hər uğurlu yazmadan sonra əlaqəli cache key-ləri təmizlənir, ona görə dəyişiklik saytda dərhal görünür.
- **Theming:** settings-dəki rənglər `:root` üzərində CSS variable kimi yazılır; Tailwind bütün komponentlərdə bu dəyişənləri istifadə edir.

---

## 04 Repo strukturu

Bir repo, iki tətbiq. Ayrı monorepo alətinə (Nx, Turborepo) ehtiyac yoxdur.

```
marketing-portfolio/
├── client/                       # React + Vite
│   ├── public/
│   │   └── _redirects            # /*   /index.html   200
│   ├── src/
│   │   ├── app/                  # store, router, providers
│   │   ├── api/                  # RTK Query: publicApi, adminApi
│   │   ├── i18n/                 # az.json, en.json, ru.json
│   │   ├── theme/                # applyTheme(), fonts, tokens
│   │   ├── lib/                  # lenis.ts, gsap.ts, localized.ts, media.ts
│   │   ├── hooks/                # useReducedMotion, useLocale, useIsTouch...
│   │   ├── components/
│   │   │   ├── ui/               # Button, MagneticButton, Container...
│   │   │   ├── motion/           # Reveal, SplitText, Parallax, Counter, Marquee
│   │   │   ├── layout/           # Header, Footer, Cursor, PageTransition
│   │   │   └── sections/         # Hero, About, Services, Work, Clients,
│   │   │                         # Testimonials, Contact
│   │   ├── pages/
│   │   │   ├── site/             # HomePage, ProjectPage, NotFoundPage
│   │   │   └── admin/            # LoginPage, Dashboard, SettingsPage, ...
│   │   └── main.tsx
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
├── server/                       # NestJS
│   ├── src/
│   │   ├── common/               # LocalizedString schema, guards, pipes,
│   │   │                         # filters, cache helpers
│   │   ├── config/               # env validation (Joi / zod)
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── settings/
│   │   │   ├── hero/
│   │   │   ├── about/
│   │   │   ├── projects/
│   │   │   ├── clients/
│   │   │   ├── testimonials/
│   │   │   ├── services/
│   │   │   ├── media/
│   │   │   ├── contact/
│   │   │   └── public/           # bootstrap endpoint (aggregator)
│   │   ├── seed/                 # admin user + default settings
│   │   └── main.ts
│   └── Dockerfile
│
├── deploy/
│   ├── docker-compose.yml
│   ├── Caddyfile
│   └── backup.sh
├── docs/SPEC.md                  # bu sənədin markdown versiyası
└── CLAUDE.md
```

> Qeyd (implementasiya): repo kökü layihə qovluğunun özüdür (`sheila portfolio/`). Tailwind v4 istifadə olunur — konfiqurasiya `tailwind.config.ts` əvəzinə CSS-də (`@theme`) olur.

---

## 05 Data modeli (Mongoose schema-ları)

Bütün tərcümə olunan mətnlər eyni alt-sxemdən istifadə edir:

```ts
// common/schemas/localized-string.schema.ts
type LocalizedString = { az: string; en: string; ru: string };

// Media referansı: hər yerdə ObjectId -> Media
```

### Singleton-lar (tək document)

Bu collection-larda həmişə bir document olur. Seed zamanı default dəyərlərlə yaradılır, admin yalnız update edir.

```ts
Settings {
  siteName: string
  logo?: ObjectId<Media>          logoDark?: ObjectId<Media>
  favicon?: ObjectId<Media>
  colors: {
    primary: string     // "#ff5a36"
    accent: string
    background: string
    surface: string
    text: string
  }
  font: { heading: 'clash' | 'space-grotesk' | 'syne',
          body:    'inter' | 'manrope' | 'dm-sans' }
  socials: [{ platform: 'instagram'|'linkedin'|'behance'|'tiktok'|'x'|'youtube',
              url: string }]
  contact: { email: string; phone?: string; location: LocalizedString }
  sections: [{ key: 'hero'|'about'|'services'|'work'|'clients'
                    |'testimonials'|'contact',
               enabled: boolean; order: number }]
  seo: { title: LocalizedString; description: LocalizedString;
         ogImage?: ObjectId<Media> }
  locales: { default: 'az'|'en'|'ru'; enabled: ('az'|'en'|'ru')[] }
  features: { customCursor: boolean; preloader: boolean; smoothScroll: boolean }
}

Hero {
  eyebrow?: LocalizedString        // kiçik üst yazı
  title: LocalizedString           // böyük başlıq (split-text animasiya)
  subtitle: LocalizedString
  cta: { label: LocalizedString; href: string }
  background: { type: 'image' | 'video' | 'none';
                media?: ObjectId<Media>; poster?: ObjectId<Media>;
                overlayOpacity: number /* 0..1 */ }
}

About {
  photo?: ObjectId<Media>
  heading: LocalizedString
  bio: LocalizedString              // sadə rich text (markdown)
  stats: [{ value: number; prefix?: string; suffix?: string;
            label: LocalizedString }] // "8+ il", "120+ kampaniya"
  timeline: [{ period: string; title: LocalizedString;
               company: string; description?: LocalizedString }]
  cv?: ObjectId<Media>              // PDF
}
```

### Collection-lar

```ts
Project (case study) {
  slug: string (unique)
  title: LocalizedString
  client: string
  category: LocalizedString        // "SMM", "Brand", "Performance"...
  year: number
  summary: LocalizedString         // kartda görünən qısa mətn
  challenge: LocalizedString
  solution: LocalizedString
  results: [{ value: number; prefix?: string; suffix?: string;
              label: LocalizedString }]   // +240% reach
  cover: ObjectId<Media>
  coverVideo?: ObjectId<Media>     // hover-da oynayan qısa loop
  gallery: ObjectId<Media>[]
  tags: string[]
  featured: boolean
  published: boolean
  order: number
  seo?: { title?: LocalizedString; description?: LocalizedString }
  timestamps
}

Client         { name; logo: ObjectId<Media>; website?; order; published }
Testimonial    { author; role: LocalizedString; company?;
                 quote: LocalizedString; avatar?: ObjectId<Media>;
                 order; published }
Service        { title: LocalizedString; description: LocalizedString;
                 icon: string /* lucide adı */; order; published }

Media {
  key: string                      // MinIO object key
  url: string                      // public URL
  type: 'image' | 'video' | 'file'
  mimeType: string; size: number
  width?: number; height?: number; duration?: number
  variants?: { w480?: string; w1024?: string; w1920?: string }   // WebP
  blurDataUrl?: string             // kiçik base64 placeholder
  alt: LocalizedString
  timestamps
}

ContactMessage {
  name; email; phone?; subject?; message
  locale: 'az'|'en'|'ru'
  read: boolean
  ip?: string; userAgent?: string
  timestamps
}

Admin { email (unique); passwordHash; lastLoginAt? }
```

**İndekslər:** `Project.slug` (unique), `Project {published, order}`, `ContactMessage {read, createdAt}`.

---

## 06 API endpoint-ləri

Prefix: `/api`. Public endpoint-lər yalnız `published: true` qeydləri qaytarır. Admin endpoint-lər `JwtAuthGuard` ilə qorunur.

### Public

| Metod | Endpoint | Təsvir |
|---|---|---|
| GET | `/public/bootstrap` | settings + hero + about + aktiv bölmələr (ilk yükləmə üçün bir sorğu) |
| GET | `/public/projects` | Case study kartları (`?featured=true`) |
| GET | `/public/projects/:slug` | Case study detalı + növbəti layihə |
| GET | `/public/services` | Xidmətlər |
| GET | `/public/clients` | Müştəri loqoları |
| GET | `/public/testimonials` | Rəylər |
| POST | `/public/contact` | Kontakt forması (throttle + honeypot) |
| GET | `/health` | Healthcheck |

### Auth

| Metod | Endpoint | Təsvir |
|---|---|---|
| POST | `/auth/login` | email + parol → `{ accessToken }` (throttle: 5/dəq) |
| GET | `/auth/me` | Token yoxlaması |
| PATCH | `/auth/password` | Parol dəyişmə |

### Admin

| Metod | Endpoint | Təsvir |
|---|---|---|
| GET / PATCH | `/admin/settings` | Sayt parametrləri (rəng, şrift, bölmələr, SEO...) |
| GET / PUT | `/admin/hero` | Hero bölməsi |
| GET / PUT | `/admin/about` | Haqqında bölməsi |
| CRUD | `/admin/projects` | GET list, GET :id, POST, PATCH :id, DELETE :id |
| PATCH | `/admin/projects/reorder` | `[{ id, order }]` — drag-and-drop sonrası |
| CRUD + reorder | `/admin/clients` | Eyni pattern |
| CRUD + reorder | `/admin/testimonials` | Eyni pattern |
| CRUD + reorder | `/admin/services` | Eyni pattern |
| POST | `/admin/media` | multipart upload (bir və ya çox fayl) |
| GET | `/admin/media` | Media kitabxanası (`?type=image&page=1`) |
| PATCH | `/admin/media/:id` | alt mətnini dəyişmə |
| DELETE | `/admin/media/:id` | İstifadədədirsə 409 qaytarır |
| GET | `/admin/messages` | Kontakt mesajları (`?read=false`) |
| PATCH / DELETE | `/admin/messages/:id` | Oxundu işarəsi / silmə |
| GET | `/admin/stats` | Dashboard: oxunmamış mesaj sayı, layihə sayı, media həcmi |

---

## 07 Backend detalları

### Modul pattern-i

Hər content modulu eyni quruluşa malikdir: `schema`, `dto` (create/update), `service`, `public.controller.ts`, `admin.controller.ts`. Reorder və published filter üçün ortaq helper-lər `common/` qovluğundadır. Singleton modullar (settings, hero, about) `findOneAndUpdate({}, dto, { upsert: true })` istifadə edir.

### Cache

- CacheModule in-memory store ilə, TTL 10 dəqiqə.
- Key-lər: `public:bootstrap`, `public:projects`, `public:project:<slug>`, `public:services`, ...
- Admin yazmasından sonra service-də əlaqəli key-lər silinir (`cache.del`). Settings/hero/about dəyişəndə `public:bootstrap` təmizlənir.
- Redis lazım deyil: tək instance və kiçik data.

### Media pipeline

- Upload limiti: şəkil 15 MB, video 60 MB, PDF 10 MB. İcazəli MIME tipləri ağ siyahı ilə yoxlanılır.
- Şəkillər sharp ilə: orijinal saxlanılır, üstəlik 480 / 1024 / 1920 px WebP variantları və 16 px-lik blur placeholder yaradılır.
- Videolar olduğu kimi saxlanılır; admin paneldə tövsiyə göstərilir: MP4 (H.264), 1080p, səssiz, 10–20 saniyəlik loop. Poster şəkli ayrıca yüklənir.
- Object key formatı: `images/2026/10/<uuid>.webp`.
- Silmədən əvvəl yoxlama: media hər hansı document-də istifadə olunursa silmə qadağandır (409 + harada istifadə olunduğunun siyahısı).

### Konfiqurasiya (.env)

```
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb://mongo:27017/portfolio
JWT_SECRET=<uzun-random-string>
JWT_EXPIRES_IN=12h
CORS_ORIGINS=https://domain.az,https://www.domain.az
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_BUCKET=media
MEDIA_PUBLIC_URL=https://media.domain.az/media
ADMIN_EMAIL=...            # seed üçün
ADMIN_PASSWORD=...         # seed üçün, ilk girişdən sonra dəyiş
SMTP_URL=...               # opsional, kontakt bildirişi
NOTIFY_EMAIL=...           # opsional
```

Client tərəfdə: `VITE_API_URL=https://api.domain.az/api`.

---

## 08 Frontend: public sayt

### Route-lar

| Route | Səhifə |
|---|---|
| `/:lang?` | Ana səhifə — bütün bölmələr `settings.sections` sırası ilə |
| `/:lang?/work/:slug` | Case study detalı |
| `*` | 404 (animasiyalı, brendə uyğun) |
| `/admin/*` | Admin panel (lazy chunk) |

Dil prefiksi olmayanda `settings.locales.default` istifadə olunur. Dil seçimi localStorage-da saxlanılır.

### Bölmələr

| Bölmə | Məzmun | Fərqləndirici element |
|---|---|---|
| Header | Loqo, naviqasiya, dil seçimi | Scroll-da gizlənir/görünür; full-screen menyu açılışı (clip-path animasiyası) |
| Hero | Başlıq, alt mətn, CTA, video/şəkil | Split-text reveal, magnetic CTA, video üzərində overlay, scroll indikatoru |
| Clients | Loqolar | Sonsuz marquee; hover-da yavaşlayır, loqo rəngə keçir |
| About | Foto, bio, rəqəmlər, timeline | Foto parallax, rəqəm counter-ləri, timeline scroll-da çəkilir |
| Services | Xidmət kartları | Hover-da kursoru izləyən spotlight effekti, böyük nömrələr |
| Work | Featured case study-lər | Pinned horizontal scroll (desktop), kart hover-da cover video oynayır |
| Testimonials | Rəylər | Böyük sitat tipoqrafiyası, drag ilə slider |
| Contact | Böyük CTA + forma | Nəhəng başlıq, forma uğurlu göndərildikdə mikro-animasiya |
| Footer | Sosial linklər, copyright | Böyük ad/loqo, "back to top" smooth scroll |

### Case study səhifəsi

- Ana səhifədən keçid zamanı cover şəkli `layoutId` ilə "böyüyərək" detal səhifəsinin hero-suna çevrilir (shared element transition).
- Struktur: hero (cover + başlıq + meta: müştəri, il, kateqoriya) → Challenge → Solution → Results (böyük animasiyalı rəqəmlər) → Qalereya (masonry, lightbox) → Növbəti layihə (tam ekran link).
- Results bölməsi marketoloq üçün ən vacib hissədir; rəqəmlər görünüş sahəsinə girəndə sayılır.

---

## 09 Animasiya planı

### Alət bölgüsü

| Ehtiyac | Alət |
|---|---|
| Komponentin görünməsi (fade/slide in), hover, tap, mount/unmount | Motion (`whileInView`, `AnimatePresence`) |
| Route keçidləri, shared element | Motion (`AnimatePresence mode="wait"`, `layoutId`) |
| Scroll ilə idarə olunan (scrub), pin, horizontal scroll, timeline | GSAP + ScrollTrigger |
| Smooth scroll | Lenis (GSAP ticker-ə bağlı) |
| Marquee | CSS animation (ən yüngül) və ya GSAP |

### Reusable motion komponentləri

```
<Reveal>             // whileInView: opacity + y, stagger dəstəyi
<SplitText>          // sözləri/hərfləri span-a bölür, mask ilə yuxarı çıxır
<Parallax speed>     // GSAP scrub ilə y hərəkəti
<Counter to>         // görünəndə 0-dan dəyərə qədər sayır
<Marquee speed>      // sonsuz sürüşən sıra
<MagneticButton>     // kursora doğru yüngül çəkilir
<Cursor />           // custom kursor; link/kart üzərində böyüyür, mətn göstərir
<PageTransition>     // route keçid pərdəsi
<Preloader />        // ilk açılışda qısa (≤1.5s) intro, sessionStorage ilə 1 dəfə
```

### Lenis + GSAP inteqrasiyası

```ts
// lib/lenis.ts
const lenis = new Lenis({ lerp: 0.1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

### Qaydalar

- `prefers-reduced-motion`: aktivdirsə Lenis, parallax, pin və split-text söndürülür; yalnız sadə fade qalır. Bunun üçün `useReducedMotion()` hook-u hər motion komponentində yoxlanılır.
- Touch cihazlar: custom cursor və magnetic effekt söndürülür; horizontal pinned scroll mobil üçün adi vertical listə çevrilir (`gsap.matchMedia`).
- Yalnız transform və opacity animasiya olunur (layout thrash yoxdur).
- GSAP kontekstləri `useGSAP` hook-u ilə yaradılır ki, unmount-da təmizlənsin.
- Admin panel heç bir ağır animasiya kitabxanasını yükləməməlidir.

---

## 10 Theming, şriftlər və i18n

### Rəng sistemi

```ts
// tailwind.config.ts
colors: {
  primary:    'rgb(var(--primary) / <alpha-value>)',
  accent:     'rgb(var(--accent) / <alpha-value>)',
  background: 'rgb(var(--background) / <alpha-value>)',
  surface:    'rgb(var(--surface) / <alpha-value>)',
  fg:         'rgb(var(--text) / <alpha-value>)',
}

// theme/applyTheme.ts
export function applyTheme(c: Colors) {
  const root = document.documentElement;
  for (const [k, hex] of Object.entries(c))
    root.style.setProperty(`--${k}`, hexToRgbTriplet(hex)); // "255 90 54"
  localStorage.setItem('theme-cache', JSON.stringify(c));
}
```

- Rənglər RGB triplet kimi saxlanılır ki, Tailwind opacity modifikatorları (`bg-primary/20`) işləsin.
- Flash qarşısının alınması: `index.html`-də kiçik inline script `theme-cache`-i oxuyub React yüklənməzdən əvvəl tətbiq edir. Bootstrap cavabı gələndə dəyərlər yenilənir.
- Admində color picker-in yanında kontrast yoxlaması göstərilir (WCAG AA: mətn/fon ≥ 4.5).

> Qeyd (implementasiya): Tailwind v4-də eyni nəticə CSS-də `@theme` ilə əldə olunur, məs. `--color-primary: rgb(var(--primary));` — opacity modifikatorları `color-mix` vasitəsilə işləyir.

### Şriftlər

Admin 2–3 əvvəlcədən seçilmiş variantdan seçir (hər şrift deyil, dizaynı pozmamaq üçün). Şriftlər `@fontsource` ilə self-host edilir; seçilən şriftin CSS-i dinamik import ilə yüklənir və `--font-heading`, `--font-body` dəyişənləri təyin olunur. Bütün variantlar Azərbaycan hərflərini (ə, ğ, ı, ş, ç, ö, ü) dəstəkləməlidir — seçmədən əvvəl yoxla.

### i18n

- Statik UI mətnləri ("Layihələr", "Əlaqə", form etiketləri): react-i18next, `i18n/az.json`, `en.json`, `ru.json`.
- Məzmun (DB-dən gələn): `LocalizedString`. Helper: `const l = useLocalized(); l(project.title)` — seçilmiş dil boşdursa default dilə fallback edir.
- Admində hər tərcümə sahəsi AZ / EN / RU tab-ları ilə göstərilir; boş qalan dillər tab-da xəbərdarlıq ikonu ilə işarələnir.

---

## 11 Admin panel

Ant Design əsasında, sadə sidebar layout. Məqsəd: texniki olmayan istifadəçi üçün aydın və səhvə dözümlü interfeys.

| Səhifə | Funksionallıq |
|---|---|
| Login | Email + parol; uğursuz cəhdlərdə throttle mesajı |
| Dashboard | Oxunmamış mesajlar, layihə/media sayları, sayta keçid linki |
| Site Settings | Loqo, favicon, rənglər (color picker + canlı preview + kontrast yoxlaması), şrift seçimi, sosial linklər, kontakt məlumatı, dillər, feature toggle-lar (cursor, preloader, smooth scroll) |
| Bölmələr | Bölmələri aç/bağla və drag-and-drop ilə sırala |
| Hero | Başlıq, alt mətn, CTA, fon tipi (şəkil/video/yox), poster, overlay şəffaflığı |
| About | Foto, bio, rəqəmlər (dinamik siyahı), timeline, CV yükləmə |
| Case Studies | Cədvəl (sürüklə-sırala, published/featured switch) + redaktə formu: slug avtomatik, results siyahısı, cover, cover video, qalereya |
| Clients / Testimonials / Services | Sadə CRUD + sıralama + published |
| Media kitabxanası | Grid görünüş, filter (şəkil/video/fayl), çoxlu upload (drag-drop), alt mətn redaktəsi, harada istifadə olunduğu |
| Mesajlar | Siyahı, oxundu/oxunmadı, silmə, email-ə cavab linki (mailto:) |
| SEO | Default title/description/OG image (Settings içində tab) |
| Hesab | Parol dəyişmə |

### UX qeydləri

- **MediaPicker** komponenti: hər media sahəsində "kitabxanadan seç" və ya "yeni yüklə" modalı. Bütün formlarda eyni komponent.
- Yadda saxlanmamış dəyişikliklər varsa səhifədən çıxarkən xəbərdarlıq.
- Hər formun yuxarısında "Saytda bax" linki (yeni tab).
- Uğurlu/uğursuz əməliyyatlar üçün `message.success/error`.

---

## 12 SEO, performans və a11y

### SEO

- react-helmet-async ilə hər səhifəyə title, description, OG/Twitter tag-ları, hreflang (az/en/ru), canonical.
- **Prerender:** build zamanı `/`, `/en`, `/ru` və bütün case study URL-ləri statik HTML-ə prerender edilir (məsələn vite-plugin-prerender və ya build sonrası Puppeteer script). Bu, sosial şəbəkə preview-ları üçün vacibdir. Yeni layihə əlavə edildikdə Netlify build hook-u çağırılır (backend-dən, opsional).
- `sitemap.xml` və `robots.txt` — backend-də `GET /sitemap.xml` kimi generasiya oluna bilər.
- JSON-LD: Person schema (ad, peşə, sosial linklər).

### Performans hədəfləri

| Metrik | Hədəf |
|---|---|
| Lighthouse Performance (mobil) | ≥ 90 |
| LCP | < 2.5 s |
| CLS | < 0.1 |
| İlk JS bundle (public, gzip) | < 200 KB |

- Admin kodu ayrı chunk-dadır; public istifadəçi onu heç vaxt yükləmir.
- GSAP/ScrollTrigger yalnız lazım olan bölmələrdə dinamik import edilir.
- Şəkillər: srcset ilə WebP variantlar, `loading="lazy"`, blur placeholder, width/height (CLS üçün).
- Hero videosu: `muted playsInline autoPlay loop preload="metadata"`, poster mütləq. Mobil + saveData rejimində video yerinə poster göstərilir.
- Şriftlər: `font-display: swap`, yalnız istifadə olunan çəkilər.

### Əlçatanlıq (a11y)

- prefers-reduced-motion dəstəyi (yuxarıda).
- Bütün interaktiv elementlər klaviatura ilə əlçatan; görünən focus halqası.
- Split-text animasiyalarında orijinal mətn `aria-label` ilə saxlanılır ki, screen reader hərfləri ayrı oxumasın.
- Media alt mətnləri admində məcburi sahədir.

---

## 13 Təhlükəsizlik

- **Auth:** tək admin, argon2 hash, JWT (12 saat). Token client-də saxlanılır, `Authorization: Bearer` header ilə göndərilir. 401 cavabında avtomatik logout.
- **Rate limit:** login 5/dəq, kontakt forması 3/dəq hər IP üçün (@nestjs/throttler). Caddy arxasında olduğu üçün trust proxy aktiv edilməlidir.
- **Spam:** kontakt formasında honeypot sahəsi + minimum doldurma vaxtı yoxlaması.
- **Validasiya:** global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.
- **Upload:** MIME + uzantı ağ siyahısı, ölçü limiti, fayl adları UUID ilə əvəz olunur; SVG upload qadağandır (XSS riski).
- **Rich text:** bio və s. markdown kimi saxlanılır, render zamanı sanitize olunur (DOMPurify).
- **CORS:** yalnız `CORS_ORIGINS`-dəki domenlər.
- **helmet** aktivdir.
- **Şəbəkə:** MongoDB və MinIO portları xaricə açılmır; yalnız Caddy 80/443 açıqdır. Hetzner firewall-da yalnız 22, 80, 443.
- **MinIO:** bucket yalnız public read; yazma yalnız backend-in access key-i ilə.
- **Secrets:** `.env` repo-ya düşmür; `.env.example` saxlanılır.

---

## 14 Deploy

### docker-compose.yml (VPS)

```yaml
services:
  api:
    build: ../server
    env_file: .env
    depends_on: [mongo, minio]
    restart: unless-stopped
    networks: [internal]

  mongo:
    image: mongo:7
    volumes: [mongo_data:/data/db]
    restart: unless-stopped
    networks: [internal]           # port expose YOXDUR

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes: [minio_data:/data]
    restart: unless-stopped
    networks: [internal]

  caddy:
    image: caddy:2
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on: [api, minio]
    restart: unless-stopped
    networks: [internal]

volumes: { mongo_data: {}, minio_data: {}, caddy_data: {} }
networks: { internal: {} }
```

### Caddyfile

```
api.domain.az {
    encode gzip zstd
    reverse_proxy api:3000
}

media.domain.az {
    header Cache-Control "public, max-age=31536000, immutable"
    reverse_proxy minio:9000
}
```

MinIO konsolunu (9001) xaricə açma; lazım olanda SSH tunnel ilə qoşul: `ssh -L 9001:localhost:9001 ...`

### Netlify

- Base directory: `client`, build command: `npm run build`, publish: `client/dist`.
- `client/public/_redirects`: `/* /index.html 200` (SPA routing).
- Environment: `VITE_API_URL`.
- Domen: `domain.az` → Netlify; `api.` və `media.` subdomenləri → VPS IP (A record).

### Backup

```bash
# deploy/backup.sh — cron: 0 3 * * *
docker compose exec -T mongo mongodump --archive --gzip > /backups/mongo-$(date +%F).gz
docker run --rm --network deploy_internal -v /backups/minio:/backup minio/mc \
  sh -c "mc alias set s http://minio:9000 $KEY $SECRET && mc mirror --overwrite s/media /backup"
find /backups -name 'mongo-*.gz' -mtime +14 -delete
```

### CI/CD (sadə)

- Client: Netlify GitHub inteqrasiyası, main-ə push → avtomatik deploy.
- Server: GitHub Actions → SSH ilə VPS-ə qoşul → `git pull && docker compose up -d --build api`. Başlanğıcda bu addım əl ilə də edilə bilər.

---

## 15 Mərhələli icra planı

| Faza | İş | Nəticə |
|---|---|---|
| 0. Hazırlıq | Repo, `client/` (Vite) və `server/` (Nest) scaffold, lokal `docker-compose.dev.yml` (mongo + minio), ESLint/Prettier, `.env.example`, `CLAUDE.md` | Hər iki tətbiq lokalda işləyir |
| 1. Backend nüvə | Config validation, `LocalizedString`, auth + seed, settings, media modulu (MinIO + sharp) | Login olub settings və media idarə etmək mümkündür |
| 2. Content modulları | hero, about, projects, clients, testimonials, services, contact, public bootstrap, cache invalidation | Bütün API hazırdır (Postman/Swagger ilə test) |
| 3. Dizayn sistemi | Moodboard → rəng/şrift tokenləri, Tailwind config, `applyTheme`, layout, Lenis + GSAP qurulumu, Cursor, motion komponentləri | Boş, amma "hiss edilən" skelet |
| 4. Public bölmələr | Hero → Clients → About → Services → Work → Testimonials → Contact → Footer; case study səhifəsi, page transition-lar | Saytın tam görünüşü |
| 5. Admin panel | Layout, login, MediaPicker, Settings (color picker + preview), bölmələr, CRUD səhifələri, mesajlar | Sayt sahibi məzmunu özü idarə edir |
| 6. Cilalama | i18n tamamlanması, reduced-motion, mobil versiya, SEO + prerender, Lighthouse optimizasiyası, a11y yoxlaması | Production-ready |
| 7. Deploy | VPS: Docker, Caddy, DNS, backup cron; Netlify; seed; real məzmunun daxil edilməsi | Canlı sayt |

> **Tövsiyə:** Faza 3-ə başlamazdan əvvəl Awwwards / Dribbble-dan 3–5 referans sayt seç və dizaynı Figma-da (və ya ən azı kağızda) qaba şəkildə çək. Animasiya ağırlıqlı saytlarda dizaynsız kodlamaq ən çox vaxt itirən hissədir.

---

## 16 Claude Code üçün qeydlər

Bu sənədi repo-da `docs/SPEC.md` kimi saxla və kökdə `CLAUDE.md` yarat. Claude Code hər sessiyada onu avtomatik oxuyur. (Faktiki `CLAUDE.md` repo kökündədir.)

### Claude Code-a ilk prompt nümunəsi

```
Read docs/SPEC.md and CLAUDE.md. Start Phase 0:
scaffold client/ (Vite React TS + Tailwind) and server/ (NestJS),
add deploy/docker-compose.dev.yml with mongo and minio,
add .env.example files and lint/prettier configs.
Do not implement features yet. Show me the tree when done.
```

Hər fazanı ayrı sessiyada və ayrı prompt ilə ver; böyük işi bir dəfəyə tapşırmaq keyfiyyəti aşağı salır.
