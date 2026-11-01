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
- Admin-written rich text (bio, challenge, solution) renders via lib/markdown.tsx
  (React elements only, no HTML injection) — never use dangerouslySetInnerHTML.
- Service icons come from the curated map in lib/icons.ts (admin picks from it).
- Images: components/ui/Img (WebP srcset + blur placeholder + width/height).
- Design direction "Signal": docs/design/DIRECTION.md; live style guide at /dev/design (dev only).
- Admin (client/src/pages/admin, components/admin, admin/, api/adminApi.ts): Ant Design 6,
  own Redux store (admin/store.ts), UI texts in Azerbaijani. Patterns: LocalizedInput (+ admin/rules
  lsRequired), MediaPicker / MediaListPicker (form value = populated Media, send toId()),
  SortableTable / SortableList (dnd-kit), useUnsavedChanges(dirty), PageHeader ("Saytda bax").
  Images need alt text (AZ) before they can be picked.
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
- SEO: public pages set their head via `useSeo(boot => homePage|projectPage|notFoundPage(...))`.
  lib/seo.ts (+ lib/localized.ts, lib/media.ts) is shared with scripts/prerender.ts, which Node
  runs with type stripping: keep those files React/DOM-free, imports type-only or with `.ts` suffix.
- `npm run build` runs the prerender: needs the API (VITE_API_URL); writes route files
  (index.html, en.html, work/<slug>.html…), spa.html (SPA fallback in _redirects), sitemap.xml,
  robots.txt. Unreachable API → shell only, unless PRERENDER_STRICT=1 (Netlify) → build fails.
- Admin writes go through PublicCacheService.invalidate(), which also schedules a debounced
  Netlify rebuild (BuildHookService, NETLIFY_BUILD_HOOK_URL; no-op when unset).
- Performance: GSAP/Lenis load on idle (lib/gsap.ts); home sections below the fold are
  React.lazy chunks (HomePage `loaders`) — only Hero/About stay in the main bundle.
- Section on/off: `SectionVisibility` banner on each section's admin page (settings.sections);
  About's experience/education block has its own flag (about.careerVisible).

## Commands
- client: npm run dev | build (incl. prerender) | prerender | lint | format
- server: npm run start:dev | build | lint | test | test:e2e | format | seed
  - seed: creates admin from ADMIN_EMAIL/ADMIN_PASSWORD + default settings (idempotent)
  - seed:demo: fills a dev DB with fictional demo content + generated images (skips if projects exist)
  - NOTE: seed/build run `nest build`, which wipes dist/ — a running start:dev may need a restart
  - test:e2e needs local infra running; uses DB `portfolio_e2e` + bucket `media-e2e`
  - Swagger (non-production): http://localhost:3000/api/docs
- local infra: docker compose -f deploy/docker-compose.dev.yml up -d
  (Mongo :27017, MinIO API :9000, console :9001 — minioadmin/minioadmin)

## Workflow
- Work phase by phase (docs/SPEC.md §15). Small commits per feature.
- Before UI work: read docs/design/DIRECTION.md.
