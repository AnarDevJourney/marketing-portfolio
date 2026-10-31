export const MEDIA_KINDS = ['image', 'video', 'file'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

const MB = 1024 * 1024;

/** Upload whitelist: MIME type -> allowed extensions, plus size limit per kind. SVG is never allowed (XSS). */
export const MEDIA_RULES: Record<
  MediaKind,
  { mimes: Record<string, string[]>; maxSize: number }
> = {
  image: {
    mimes: {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp'],
      'image/avif': ['avif'],
    },
    maxSize: 15 * MB,
  },
  video: {
    mimes: { 'video/mp4': ['mp4'], 'video/webm': ['webm'] },
    maxSize: 60 * MB,
  },
  file: {
    mimes: { 'application/pdf': ['pdf'] },
    maxSize: 10 * MB,
  },
};

/** Largest single file Multer accepts; per-kind limits are checked afterwards. */
export const MAX_UPLOAD_SIZE = 60 * MB;
export const MAX_FILES_PER_UPLOAD = 10;

/** Widths of the generated WebP variants. */
export const IMAGE_WIDTHS = [480, 1024, 1920] as const;

/**
 * Where Media ObjectIds are referenced: collection -> field paths
 * (arrays of ids work too). Used to block deleting media that is in use.
 * Every module that stores media refs must be listed here.
 */
export const MEDIA_REFERENCES: { collection: string; fields: string[] }[] = [
  {
    collection: 'settings',
    fields: ['logo', 'logoDark', 'favicon', 'seo.ogImage'],
  },
  { collection: 'hero', fields: ['background.media', 'background.poster'] },
  { collection: 'about', fields: ['photo', 'cv'] },
  { collection: 'projects', fields: ['cover', 'coverVideo', 'gallery'] },
  { collection: 'clients', fields: ['logo'] },
  { collection: 'testimonials', fields: ['avatar'] },
];
