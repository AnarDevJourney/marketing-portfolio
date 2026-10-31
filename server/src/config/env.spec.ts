import { validateEnv } from './env.js';

const valid = {
  MONGO_URI: 'mongodb://localhost:27017/portfolio',
  JWT_SECRET: 'a-very-long-secret-value',
  CORS_ORIGINS: 'https://domain.az, https://www.domain.az',
  MINIO_ENDPOINT: 'minio',
  MINIO_ACCESS_KEY: 'key',
  MINIO_SECRET_KEY: 'secret',
  MEDIA_PUBLIC_URL: 'https://media.domain.az/media/',
};

describe('validateEnv', () => {
  it('applies defaults and transforms values', () => {
    const env = validateEnv({ ...valid, ADMIN_EMAIL: '' });
    expect(env.PORT).toBe(3000);
    expect(env.MINIO_BUCKET).toBe('media');
    expect(env.CORS_ORIGINS).toEqual([
      'https://domain.az',
      'https://www.domain.az',
    ]);
    expect(env.MEDIA_PUBLIC_URL).toBe('https://media.domain.az/media');
    expect(env.ADMIN_EMAIL).toBeUndefined();
  });

  it('rejects a short JWT secret and missing values', () => {
    expect(() => validateEnv({ ...valid, JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
    expect(() => validateEnv({ ...valid, MONGO_URI: undefined })).toThrow(
      /MONGO_URI/,
    );
  });
});
