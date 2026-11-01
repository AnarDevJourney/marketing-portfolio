# Deploy (pulsuz variant — TaskFlow ilə eyni yol)

| | Harada | Ünvan (nümunə) |
|---|---|---|
| Sayt + admin panel | Netlify (pulsuz subdomen) | `https://sheyla-portfolio.netlify.app` (`/admin`) |
| API + media | Hetzner VPS, Docker + host Nginx + Let's Encrypt | `https://sheila-portfolio.duckdns.org/api`, `/media` |
| Backend domeni | DuckDNS (pulsuz) | `sheila-portfolio.duckdns.org` |

TaskFlow eyni VPS-də işləyir: Nginx-i (80/443) paylaşırıq, portlar toqquşmur
(portfolio: `127.0.0.1:3100` API, `9100` MinIO, `9101` MinIO konsolu; Mongo xaricə açılmır).

Sıra vacibdir: əvvəl backend (VPS), sonra Netlify — Netlify build-i prerender üçün API-yə müraciət edir.

## 0. VPS resursları

```bash
free -h; df -h /
```
TaskFlow + portfolio birlikdə: ~2.5–3 GB RAM. 4 GB-lıq server kifayətdir.

## 1. DuckDNS subdomeni

duckdns.org → (TaskFlow üçün istifadə etdiyin hesabla) giriş → **sub domain** yaz
(məs. `sheila-portfolio`) → **add domain** → **current ip** sahəsinə VPS-in IPv4-ünü yaz → **update ip**.

Yoxlama: `dig +short sheila-portfolio.duckdns.org` → VPS IP.

## 2. Backend-i işə salmaq

```bash
ssh root@VPS_IP
git clone https://github.com/AnarDevJourney/marketing-portfolio.git /opt/portfolio
cd /opt/portfolio/deploy
cp .env.example .env
openssl rand -hex 32    # → JWT_SECRET
openssl rand -hex 24    # → MINIO_SECRET_KEY
nano .env               # CORS_ORIGINS, MEDIA_PUBLIC_URL, ADMIN_EMAIL, ADMIN_PASSWORD, secret-lər
chmod 600 .env

docker compose up -d --build
docker compose ps                                  # api "healthy"
curl http://127.0.0.1:3100/api/health              # {"status":"ok"}
docker compose exec api node dist/seed/seed.js     # admin + default ayarlar
```

## 3. Nginx + HTTPS

```bash
cp /opt/portfolio/deploy/nginx.conf /etc/nginx/sites-available/portfolio
sed -i 's/PORTFOLIO_DOMAIN/sheila-portfolio.duckdns.org/g' /etc/nginx/sites-available/portfolio
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d sheila-portfolio.duckdns.org    # redirect sualına: 2 (Redirect)

curl https://sheila-portfolio.duckdns.org/api/health
```
Sertifikat certbot timer-i ilə avtomatik yenilənir (TaskFlow-dakı kimi).

## 4. Netlify

1. app.netlify.com → **Add new site → Import an existing project → GitHub** → `marketing-portfolio`.
   Build ayarları `netlify.toml`-dan gəlir (base `client`, publish `dist`, Node 24).
2. **Site configuration → Site details → Change site name** → `sheyla-portfolio`
   (`CORS_ORIGINS`-dəki adla eyni olmalıdır).
3. **Site configuration → Environment variables:**
   - `VITE_API_URL` = `https://sheila-portfolio.duckdns.org/api`
   - `VITE_SITE_URL` = `https://sheyla-portfolio.netlify.app`
4. **Deploys → Trigger deploy**. Build log-da `✓ prerendered N pages` görünməlidir.
5. `https://sheyla-portfolio.netlify.app/admin` → seed-dəki admin ilə giriş → şifrəni dəyiş.

## 5. Build hook (admin dəyişikliklərindən sonra avtomatik rebuild)

Netlify → **Site configuration → Build & deploy → Build hooks → Add build hook** → URL-i kopyala →
VPS-də `.env`: `NETLIFY_BUILD_HOOK_URL=...` → `docker compose up -d api`.

## 6. Backup

```bash
crontab -e
0 3 * * * /opt/portfolio/deploy/backup.sh >> /var/log/portfolio-backup.log 2>&1
```
Backup-lar eyni serverdədir — Hetzner Cloud Console-da **Backups**-ı da aktiv etmək tövsiyə olunur.

## Yeniləmə

- Frontend: `main`-ə push → Netlify avtomatik deploy edir.
- Backend: VPS-də `/opt/portfolio/deploy/update.sh`.

## Sonradan öz domeni qoşmaq

Netlify → **Domain management → Add domain**. Sonra `VITE_SITE_URL`-i və VPS-də
`CORS_ORIGINS`-i yeni domenlə yenilə, Netlify-da yenidən deploy et.

## Faydalı əmrlər

```bash
cd /opt/portfolio/deploy
docker compose logs -f api                         # API log-ları
ssh -L 9101:localhost:9101 root@VPS_IP             # MinIO konsolu → http://localhost:9101
docker compose exec -T mongo mongorestore --archive --gzip --drop < /var/backups/portfolio/mongo-YYYY-MM-DD.gz
```
