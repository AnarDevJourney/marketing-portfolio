export const LOCALES = ['az', 'en', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
