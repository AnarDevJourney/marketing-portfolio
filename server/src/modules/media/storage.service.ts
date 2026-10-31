import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { Env } from '../../config/env.js';

/** Thin wrapper around the MinIO bucket that holds all media. */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(config: ConfigService<Env, true>) {
    this.client = new Client({
      endPoint: config.get('MINIO_ENDPOINT', { infer: true }),
      port: config.get('MINIO_PORT', { infer: true }),
      useSSL: false,
      accessKey: config.get('MINIO_ACCESS_KEY', { infer: true }),
      secretKey: config.get('MINIO_SECRET_KEY', { infer: true }),
    });
    this.bucket = config.get('MINIO_BUCKET', { infer: true });
    this.publicUrl = config.get('MEDIA_PUBLIC_URL', { infer: true });
  }

  /** Makes sure the bucket exists and is publicly readable (writes stay key-only). */
  async onModuleInit() {
    try {
      if (!(await this.client.bucketExists(this.bucket))) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Created bucket "${this.bucket}"`);
      }
      await this.client.setBucketPolicy(
        this.bucket,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        }),
      );
    } catch (err) {
      throw new Error(
        `MinIO is not reachable or misconfigured: ${(err as Error).message}`,
      );
    }
  }

  async put(key: string, data: Buffer, contentType: string) {
    await this.client.putObject(this.bucket, key, data, data.length, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    return this.urlFor(key);
  }

  async remove(keys: string[]) {
    if (keys.length) await this.client.removeObjects(this.bucket, keys);
  }

  urlFor(key: string) {
    return `${this.publicUrl}/${key}`;
  }

  keyFromUrl(url: string) {
    return url.startsWith(`${this.publicUrl}/`)
      ? url.slice(this.publicUrl.length + 1)
      : null;
  }
}
