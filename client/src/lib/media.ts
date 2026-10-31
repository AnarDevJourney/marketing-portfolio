import type { Locale, Media } from '../api/types'
import { localize } from './localized'

const VARIANT_WIDTHS = [
  ['w480', 480],
  ['w1024', 1024],
  ['w1920', 1920],
] as const

/** srcset built from the WebP variants generated on upload. */
export function srcSet(media: Media) {
  return VARIANT_WIDTHS.flatMap(([key, w]) =>
    media.variants?.[key] ? [`${media.variants[key]} ${w}w`] : [],
  ).join(', ')
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
