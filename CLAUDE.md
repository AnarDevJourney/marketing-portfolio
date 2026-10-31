# CLAUDE.md

## Project
Marketing portfolio website for a marketing professional.
Priority: visual quality, animations, distinct modern UI. Small admin panel.
Full spec: docs/SPEC.md — read the relevant section before starting a task.
Domain placeholder: domain.az.

## Stack
- client/: React + Vite + TS, Tailwind v4, Motion, GSAP+ScrollTrigger, Lenis,
  RTK Query, react-i18next, Ant Design (ADMIN ONLY)
- server/: NestJS + Mongoose + MongoDB, MinIO, JWT (single admin)
- deploy/: Docker Compose + Caddy on Hetzner; client on Netlify
- Linting: oxlint (scaffold default) + Prettier in both apps.

## Rules
- No overengineering: no Redis, queues, microservices, extra auth roles.
- Never import antd or admin code into public site chunks.
- Animate only transform/opacity. Every motion component must respect
  useReducedMotion() and disable heavy effects on touch devices.
- GSAP inside useGSAP() for cleanup. Lenis is synced to gsap.ticker.
- Colors only via Tailwind tokens backed by CSS variables (no hex in JSX).
- All translatable content uses LocalizedString { az, en, ru };
  read via useLocalized(). Static UI strings via react-i18next.
- Every admin write must invalidate the related public cache keys.
- DTOs validated with class-validator; global whitelist ValidationPipe.
- Public endpoints return only published items, sorted by `order`.
- Server is ESM (`"type": "module"`): relative imports use the `.js` suffix.

## Commands
- client: npm run dev | build | lint | format
- server: npm run start:dev | build | lint | test | test:e2e | format | seed (seed: Phase 1)
- local infra: docker compose -f deploy/docker-compose.dev.yml up -d
  (Mongo :27017, MinIO API :9000, console :9001 — minioadmin/minioadmin)

## Workflow
- Work phase by phase (docs/SPEC.md §15). Small commits per feature.
- Before UI work: check the design references in docs/design/.
