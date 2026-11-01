import type { Locale, LocalizedString } from '../api/types.ts'

/** Picks the text for `locale`, falling back to the default locale, then to any non-empty value. */
export function localize(
  value: LocalizedString | undefined | null,
  locale: Locale,
  fallback: Locale,
): string {
  if (!value) return ''
  return (
    value[locale] || value[fallback] || Object.values(value).find(Boolean) || ''
  )
}

/** Strips the `*highlight*` markers used in headings (see SplitText). */
export function plainText(text: string) {
  return text.replace(/\*/g, '')
}
