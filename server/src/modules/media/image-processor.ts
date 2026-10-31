import { BadRequestException } from '@nestjs/common';
import sharp, { type Sharp } from 'sharp';
import { IMAGE_WIDTHS } from './media.constants.js';

/** sharp's format name for each allowed image MIME type. */
const SHARP_FORMATS: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'heif',
};

export interface ProcessedImage {
  /** Original re-encoded in its own format, EXIF-rotated and without metadata (no GPS leaks). */
  original: Buffer;
  width: number;
  height: number;
  variants: { width: (typeof IMAGE_WIDTHS)[number]; buffer: Buffer }[];
  blurDataUrl: string;
}

export async function processImage(
  input: Buffer,
  mimeType: string,
): Promise<ProcessedImage> {
  const meta = await sharp(input)
    .metadata()
    .catch(() => null);
  if (!meta || meta.format !== SHARP_FORMATS[mimeType]) {
    throw new BadRequestException('File is not a valid image');
  }

  const base = sharp(input, { limitInputPixels: 60_000_000 }).rotate();
  const { data: original, info } = await encodeOriginal(
    base.clone(),
    mimeType,
  ).toBuffer({ resolveWithObject: true });

  // Never upscale; always keep the smallest variant so there is a WebP to serve.
  const widths = IMAGE_WIDTHS.filter((w, i) => i === 0 || w < info.width);
  const variants = await Promise.all(
    widths.map(async (width) => ({
      width,
      buffer: await base
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer(),
    })),
  );

  const blur = await base.clone().resize(16).webp({ quality: 40 }).toBuffer();

  return {
    original,
    width: info.width,
    height: info.height,
    variants,
    blurDataUrl: `data:image/webp;base64,${blur.toString('base64')}`,
  };
}

function encodeOriginal(img: Sharp, mimeType: string): Sharp {
  switch (mimeType) {
    case 'image/jpeg':
      return img.jpeg({ quality: 90, mozjpeg: true });
    case 'image/webp':
      return img.webp({ quality: 90 });
    case 'image/avif':
      return img.avif({ quality: 70 });
    default:
      return img.png();
  }
}
