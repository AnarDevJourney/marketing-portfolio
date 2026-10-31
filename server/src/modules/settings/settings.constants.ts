import type { Locale } from '../../common/locales.js';

export const HEADING_FONTS = ['clash', 'space-grotesk', 'syne'] as const;
export const BODY_FONTS = ['inter', 'manrope', 'dm-sans'] as const;
export const SOCIAL_PLATFORMS = [
  'instagram',
  'linkedin',
  'behance',
  'tiktok',
  'x',
  'youtube',
] as const;
export const SECTION_KEYS = [
  'hero',
  'clients',
  'about',
  'services',
  'work',
  'testimonials',
  'contact',
] as const;
export const COLOR_KEYS = [
  'primary',
  'accent',
  'background',
  'surface',
  'text',
] as const;

export type HeadingFont = (typeof HEADING_FONTS)[number];
export type BodyFont = (typeof BODY_FONTS)[number];
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type SectionKey = (typeof SECTION_KEYS)[number];

export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Placeholder values written on first start / seed. Real palette comes in Phase 3. */
export const DEFAULT_SETTINGS = {
  siteName: 'Portfolio',
  colors: {
    primary: '#ff5a36',
    accent: '#c6f432',
    background: '#0e0e0e',
    surface: '#1a1a1a',
    text: '#f4f1ea',
  },
  font: { heading: 'clash' as HeadingFont, body: 'inter' as BodyFont },
  socials: [],
  contact: {
    email: 'hello@domain.az',
    location: {
      az: 'Bakı, Azərbaycan',
      en: 'Baku, Azerbaijan',
      ru: 'Баку, Азербайджан',
    },
  },
  sections: SECTION_KEYS.map((key, order) => ({ key, enabled: true, order })),
  seo: {
    title: { az: 'Portfolio', en: 'Portfolio', ru: 'Портфолио' },
    description: { az: '', en: '', ru: '' },
  },
  locales: { default: 'az' as Locale, enabled: ['az', 'en', 'ru'] as Locale[] },
  features: { customCursor: true, preloader: true, smoothScroll: true },
};
