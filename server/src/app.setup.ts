import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { DuplicateKeyFilter } from './common/filters/duplicate-key.filter.js';
import { Env } from './config/env.js';

/** Global app configuration, shared by main.ts and the e2e tests. */
export function configureApp(app: NestExpressApplication) {
  const config = app.get(ConfigService<Env, true>);
  const isProd = config.get('NODE_ENV', { infer: true }) === 'production';

  // Behind Caddy: trust the first proxy so req.ip (rate limiting) is the client IP.
  app.set('trust proxy', 1);
  // Swagger UI needs inline scripts, so CSP is only enforced in production.
  app.use(helmet({ contentSecurityPolicy: isProd ? undefined : false }));
  app.enableCors({ origin: config.get('CORS_ORIGINS', { infer: true }) });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(
    new DuplicateKeyFilter(app.get(HttpAdapterHost).httpAdapter),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (!isProd) {
    const doc = new DocumentBuilder()
      .setTitle('Marketing Portfolio API')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, () =>
      SwaggerModule.createDocument(app, doc),
    );
  }
}
