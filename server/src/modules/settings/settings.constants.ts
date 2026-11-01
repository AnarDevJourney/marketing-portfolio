import type { Locale } from '../../common/locales.js';

/**
 * Font options. Every one was checked to contain the Azerbaijani letters
 * (Ə ə Ğ ğ I ı İ Ş ş Ç ç Ö ö Ü ü) and Cyrillic. The spec's original picks
 * failed that check (Syne/Manrope lack Ə, Space Grotesk/DM Sans lack
 * Cyrillic, Clash Display isn't on fontsource).
 */
export const HEADING_FONTS = [
  'unbounded',
  'geologica',
  'playfair-display',
] as const;
export const BODY_FONTS = ['onest', 'inter', 'commissioner'] as const;
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

/** Values written on first start / seed. */
const DEFAULT_HIDDEN_SECTIONS: readonly SectionKey[] = ['hero', 'clients'];

export const DEFAULT_SETTINGS = {
  siteName: 'Portfolio',
  // "Signal" palette — see docs/design/DIRECTION.md.
  colors: {
    primary: '#ff5b2e',
    accent: '#b8a6ff',
    background: '#0d0c0a',
    surface: '#181613',
    text: '#f2ede3',
  },
  font: { heading: 'unbounded' as HeadingFont, body: 'onest' as BodyFont },
  socials: [],
  contact: {
    email: 'hello@domain.az',
    location: {
      az: 'Bakı, Azərbaycan',
      en: 'Baku, Azerbaijan',
      ru: 'Баку, Азербайджан',
    },
  },
  // Hero and clients start hidden (client request 2026-11-01); the admin can turn them on.
  sections: SECTION_KEYS.map((key, order) => ({
    key,
    enabled: !DEFAULT_HIDDEN_SECTIONS.includes(key),
    order,
  })),
  seo: {
    title: { az: 'Portfolio', en: 'Portfolio', ru: 'Портфолио' },
    description: { az: '', en: '', ru: '' },
  },
  locales: { default: 'az' as Locale, enabled: ['az', 'en', 'ru'] as Locale[] },
  features: { customCursor: true, preloader: true, smoothScroll: true },
  workGroups: {
    enabled: true,
    primary: {
      az: 'Marketoloq kimi',
      en: 'As a marketer',
      ru: 'Как маркетолог',
    },
    secondary: {
      az: 'Event menecer kimi',
      en: 'As an event manager',
      ru: 'Как ивент-менеджер',
    },
  },
};
