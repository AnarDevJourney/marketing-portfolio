# Deploy

Backend (API + MongoDB + MinIO + Caddy) — Hetzner VPS, Docker Compose (`deploy/`).
Frontend (sayt + admin panel) — Netlify (`netlify.toml`).

```
domain.az        → Netlify (sayt, admin: domain.az/admin)
api.domain.az    → VPS → Caddy → api:3000
media.domain.az  → VPS → Caddy → minio:9000 (şəkillər, videolar, CV)
```

Sıra vacibdir: əvvəl VPS (API), sonra Netlify — Netlify build-i prerender üçün API-yə müraciət edir.

## 1. DNS

Domen panelində (A record, IP = VPS-in IPv4-ü; IPv6 varsa AAAA da):

| Host | Tip | Dəyər |
|---|---|---|
| `api` | A | VPS IP |
| `media` | A | VPS IP |

`domain.az` və `www` Netlify addımında qoşulur (6-cı addım).
Yoxlama: `dig +short api.domain.az` → VPS IP.

## 2. VPS hazırlığı (bir dəfə)

```bash
ssh root@VPS_IP
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh          # Docker + compose plugin
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
git clone https://github.com/AnarDevJourney/marketing-portfolio.git /opt/portfolio
```

## 3. Konfiqurasiya

```bash
cd /opt/portfolio/deploy
cp .env.example .env
openssl rand -hex 32    # JWT_SECRET üçün
openssl rand -hex 24    # MINIO_SECRET_KEY üçün
nano .env               # domenlər, e-mail, secret-lər, CORS_ORIGINS, MEDIA_PUBLIC_URL, ADMIN_*
chmod 600 .env
```

## 4. İşə salma

```bash
docker compose up -d --build
docker compose ps                       # hamısı "running", api "healthy"
docker compose logs -f caddy            # sertifikat alınması
curl https://api.domain.az/api/health   # {"status":"ok"}
docker compose exec api node dist/seed/seed.js   # admin + default ayarlar
```

Seed-dən sonra `.env`-dən `ADMIN_PASSWORD`-u silmək olar (şifrə admin paneldən dəyişdirilir).

## 5. Netlify

1. app.netlify.com → **Add new site → Import an existing project → GitHub** → `marketing-portfolio`.
   Build ayarları `netlify.toml`-dan gəlir (base `client`, publish `dist`, Node 24).
2. **Site configuration → Environment variables:**
   - `VITE_API_URL` = `https://api.domain.az/api`
   - `VITE_SITE_URL` = `https://domain.az`
3. Deploy. Build log-da `✓ prerendered N pages` görünməlidir.
4. Domen qoşulana qədər test üçün `https://<sayt>.netlify.app` ünvanını VPS-də
   `CORS_ORIGINS`-ə əlavə et → `docker compose up -d api`.

## 6. Domen → Netlify

Netlify → **Domain management → Add domain** → `domain.az`. Netlify-ın göstərdiyi DNS
qeydlərini domen panelində əlavə et (apex üçün A `75.2.60.5` və ya Netlify DNS, `www` üçün CNAME).
HTTPS-i Netlify özü aktivləşdirir.

## 7. Build hook (admin dəyişikliklərindən sonra avtomatik rebuild)

Netlify → **Site configuration → Build & deploy → Build hooks → Add** → URL-i kopyala →
VPS-də `.env`: `NETLIFY_BUILD_HOOK_URL=...` → `docker compose up -d api`.

## 8. Backup

```bash
crontab -e
0 3 * * * /opt/portfolio/deploy/backup.sh >> /var/log/portfolio-backup.log 2>&1
```

Hetzner Cloud Console-da **Backups**-ı da aktiv et (backup-lar eyni serverdədir).

## Yeniləmə

- Frontend: `main`-ə push → Netlify avtomatik deploy edir.
- Backend: VPS-də `/opt/portfolio/deploy/update.sh`.

## Faydalı əmrlər

```bash
docker compose logs -f api                       # API log-ları
ssh -L 9001:localhost:9001 root@VPS_IP           # MinIO konsolu → http://localhost:9001
docker compose exec -T mongo mongorestore --archive --gzip --drop < /var/backups/portfolio/mongo-YYYY-MM-DD.gz
```
