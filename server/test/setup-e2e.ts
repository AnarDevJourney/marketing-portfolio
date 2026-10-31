// E2E tests run against the local dev infra (docker-compose.dev.yml) using
// a separate database and bucket. Real env vars still take precedence.
const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  MONGO_URI: 'mongodb://localhost:27017/portfolio_e2e',
  JWT_SECRET: 'e2e-secret-at-least-16-chars',
  JWT_EXPIRES_IN: '1h',
  CORS_ORIGINS: 'http://localhost:5173',
  MINIO_ENDPOINT: 'localhost',
  MINIO_PORT: '9000',
  MINIO_ACCESS_KEY: 'minioadmin',
  MINIO_SECRET_KEY: 'minioadmin',
  MINIO_BUCKET: 'media-e2e',
  MEDIA_PUBLIC_URL: 'http://localhost:9000/media-e2e',
};
for (const [key, value] of Object.entries(defaults)) {
  process.env[key] ??= value;
}
