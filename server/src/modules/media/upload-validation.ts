import { BadRequestException } from '@nestjs/common';
import { extname } from 'node:path';
import { MEDIA_KINDS, MEDIA_RULES, type MediaKind } from './media.constants.js';

export interface UploadFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const MB = 1024 * 1024;

/**
 * Checks an upload against the whitelist (MIME, extension, size) and its
 * magic bytes. Image content is verified later by sharp.
 */
export function classifyUpload(file: UploadFile): {
  kind: MediaKind;
  ext: string;
} {
  const name = file.originalname;
  const ext = extname(name).slice(1).toLowerCase();
  const kind = MEDIA_KINDS.find((k) => file.mimetype in MEDIA_RULES[k].mimes);
  if (!kind) {
    throw new BadRequestException(`${name}: file type is not allowed`);
  }

  const rules = MEDIA_RULES[kind];
  if (!rules.mimes[file.mimetype].includes(ext)) {
    throw new BadRequestException(
      `${name}: extension does not match file type`,
    );
  }
  if (file.size > rules.maxSize) {
    throw new BadRequestException(
      `${name}: ${kind} files must be at most ${rules.maxSize / MB} MB`,
    );
  }
  if (!hasValidSignature(file.mimetype, file.buffer)) {
    throw new BadRequestException(`${name}: file content does not match type`);
  }
  return { kind, ext };
}

function hasValidSignature(mime: string, buf: Buffer): boolean {
  switch (mime) {
    case 'application/pdf':
      return buf.subarray(0, 5).toString('latin1') === '%PDF-';
    case 'video/mp4':
      return buf.subarray(4, 8).toString('latin1') === 'ftyp';
    case 'video/webm':
      return buf.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    default:
      return true;
  }
}
