import type { Locale, Media } from '../api/types.ts'
import { localize } from './localized.ts'

const VARIANT_WIDTHS = [
  ['w480', 480],
  ['w1024', 1024],
  ['w1920', 1920],
] as const

/**
 * srcset built from the WebP variants generated on upload, plus the original as the
 * largest candidate (variants only exist below the original's width — without it a
 * 1000px image would top out at 480w and look soft on high-DPI phones).
 */
export function srcSet(media: Media) {
  const candidates = VARIANT_WIDTHS.flatMap(([key, w]) =>
    media.variants?.[key] ? [`${media.variants[key]} ${w}w`] : [],
  )
  const largest = VARIANT_WIDTHS.filter(([key]) => media.variants?.[key]).at(-1)
  if (candidates.length && media.width && media.width > (largest?.[1] ?? 0))
    candidates.push(`${media.url} ${media.width}w`)
  return candidates.join(', ')
}

/** Props for a responsive <img>: WebP srcset, intrinsic size (no CLS), localized alt. */
export function imageProps(
  media: Media,
  locale: Locale,
  fallback: Locale,
  sizes = '100vw',
) {
  return {
    src: media.variants?.w1024 ?? media.url,
    srcSet: srcSet(media) || undefined,
    sizes,
    width: media.width,
    height: media.height,
    alt: localize(media.alt, locale, fallback),
  }
}
