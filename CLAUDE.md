# CLAUDE.md

## Project
Marketing portfolio website for a marketing professional.
Priority: visual quality, animations, distinct modern UI. Small admin panel.
Full spec: docs/SPEC.md — read the relevant section before starting a task.
Domain placeholder: domain.az.

## Stack
- client/: React + Vite + TS, Tailwind v4, Motion, GSAP+ScrollTrigger, Lenis,
  RTK Query, react-i18next, React Router 8, Ant Design (ADMIN ONLY)
- server/: NestJS + Mongoose + MongoDB, MinIO, JWT (single admin)
- deploy/: Docker Compose + Caddy on Hetzner; client on Netlify
- Linting: oxlint (scaffold default) + Prettier in both apps.

## Rules
- No overengineering: no Redis, queues, microservices, extra auth roles.
- Never import antd or admin code into public site chunks.
- Animate only transform/opacity. Every motion component must respect
  useReducedMotion() and disable heavy effects on touch devices.
- Motion: use `m.*` components (LazyMotion strict in main.tsx), never `motion.*`;
  number tweens via lib/tween.ts, not Motion's animate() (keeps initial JS < 200 KB gzip).
- GSAP only through hooks/useGsap (lazy-loaded, gsap.context cleanup) — never import
  gsap statically. Lenis (lib/lenis.ts) is synced to gsap.ticker; use scrollToTarget().
- Colors only via Tailwind tokens backed by CSS variables (no hex in JSX):
  bg-background, bg-surface, text-fg, bg-primary, text-accent (+ /opacity).
  Type scale: text-display/h1/h2/h3/lead/label; spacing: px-gutter, py-section.
- Headings support `*word*` = marker highlight (SplitText → Highlight).
- Design direction "Signal": docs/design/DIRECTION.md; live style guide at /dev/design (dev only).
- All translatable content uses LocalizedString { az, en, ru };
  read via useLocalized(). Static UI strings via react-i18next.
- Every admin write must invalidate the related public cache keys.
- DTOs validated with class-validator; global whitelist ValidationPipe.
- Public endpoints return only published items, sorted by `order`.
- Server is ESM (`"type": "module"`): relative imports use the `.js` suffix;
  type-only imports (e.g. mongoose `Connection`) must use `import type`.
- Module pattern: schema, dto/, service, admin.controller.ts, public.controller.ts.
  Singletons: settings (PATCH, $set per top-level field), hero/about (PUT, replaceOne).
  Sortable collections (projects, clients, testimonials, services) extend
  common/crud/OrderedCrudService (CRUD, reorder, cached published lists).
  Declare `PATCH reorder` before `:id` routes.
- Public responses are cached via PublicCacheService.wrap(key); admin writes call
  invalidate(prefix). Keys live in common/cache/cache-keys.ts.
- Required nested DTO fields need `@IsDefined()` before `@ValidateNested()`
  (ValidateNested alone lets `undefined` through → 500 from Mongoose).
- Media refs: validate with MediaService.assertExist(ids, 'image'|'video'|'file');
  populate with populateMedia(...paths).
- New fields that reference Media must be added to MEDIA_REFERENCES
  (server/src/modules/media/media.constants.ts) so in-use deletes are blocked.

## Commands
- client: npm run dev | build | lint | format
- server: npm run start:dev | build | lint | test | test:e2e | format | seed
  - seed: creates admin from ADMIN_EMAIL/ADMIN_PASSWORD + default settings (idempotent)
  - test:e2e needs local infra running; uses DB `portfolio_e2e` + bucket `media-e2e`
  - Swagger (non-production): http://localhost:3000/api/docs
- local infra: docker compose -f deploy/docker-compose.dev.yml up -d
  (Mongo :27017, MinIO API :9000, console :9001 — minioadmin/minioadmin)

## Workflow
- Work phase by phase (docs/SPEC.md §15). Small commits per feature.
- Before UI work: read docs/design/DIRECTION.md.
