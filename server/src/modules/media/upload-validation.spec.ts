import { BadRequestException } from '@nestjs/common';
import { classifyUpload, UploadFile } from './upload-validation.js';

const file = (overrides: Partial<UploadFile>): UploadFile => ({
  originalname: 'photo.jpg',
  mimetype: 'image/jpeg',
  size: 1024,
  buffer: Buffer.alloc(16),
  ...overrides,
});

describe('classifyUpload', () => {
  it('accepts whitelisted types', () => {
    expect(classifyUpload(file({}))).toEqual({ kind: 'image', ext: 'jpg' });
    expect(
      classifyUpload(
        file({
          originalname: 'Reel.MP4',
          mimetype: 'video/mp4',
          buffer: Buffer.from('\0\0\0\x18ftypmp42'),
        }),
      ),
    ).toEqual({ kind: 'video', ext: 'mp4' });
  });

  it.each([
    ['SVG', { originalname: 'a.svg', mimetype: 'image/svg+xml' }],
    ['wrong extension', { originalname: 'a.png' }],
    ['oversized image', { size: 16 * 1024 * 1024 }],
    ['fake mp4', { originalname: 'a.mp4', mimetype: 'video/mp4' }],
  ])('rejects %s', (_, overrides) => {
    expect(() => classifyUpload(file(overrides))).toThrow(BadRequestException);
  });
});
