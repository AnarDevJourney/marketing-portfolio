/** Keys of cached public responses. Admin writes must delete the related keys. */
export const CACHE_KEYS = {
  bootstrap: 'public:bootstrap',
} as const;

/** TTL for public responses (ms). */
export const PUBLIC_CACHE_TTL = 10 * 60 * 1000;
