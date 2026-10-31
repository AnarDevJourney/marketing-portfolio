/** Keys (and key prefixes) of cached public responses. Admin writes must invalidate the related ones. */
export const CACHE_KEYS = {
  /** Prefix of every public key; invalidating it drops the whole public cache. */
  all: 'public:',
  bootstrap: 'public:bootstrap',
  /** Prefix covering both project lists and project details. */
  projects: 'public:project',
  projectList: (featured: boolean) =>
    `public:projects:${featured ? 'featured' : 'all'}`,
  project: (slug: string) => `public:project:${slug}`,
  services: 'public:services',
  clients: 'public:clients',
  testimonials: 'public:testimonials',
} as const;

/** TTL for public responses (ms). */
export const PUBLIC_CACHE_TTL = 10 * 60 * 1000;
