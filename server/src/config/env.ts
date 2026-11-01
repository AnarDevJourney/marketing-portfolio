import { z } from 'zod';

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  MONGO_URI: z.string().min(1),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]?$/, 'expected e.g. 12h, 30m, 3600')
    .default('12h'),

  CORS_ORIGINS: z.string().transform((s) =>
    s
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ),

  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET: z.string().min(3).default('media'),
  MEDIA_PUBLIC_URL: z.url().transform((u) => u.replace(/\/+$/, '')),

  // seed only
  ADMIN_EMAIL: optional(z.email()),
  ADMIN_PASSWORD: optional(z.string().min(8)),

  // optional: Netlify build hook, called (debounced) after admin content changes
  NETLIFY_BUILD_HOOK_URL: optional(z.url()),

  // optional contact notifications
  SMTP_URL: optional(z.string()),
  NOTIFY_EMAIL: optional(z.email()),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
