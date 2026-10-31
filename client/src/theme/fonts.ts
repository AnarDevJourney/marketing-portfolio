import type { BodyFont, FontChoice, HeadingFont } from '../api/types'

/*
 * Self-hosted variable fonts; only the chosen ones are downloaded.
 * All options contain the Azerbaijani letters and Cyrillic (checked in Phase 3).
 */
const HEADING_FONTS: Record<
  HeadingFont,
  { family: string; load: () => Promise<unknown> }
> = {
  unbounded: {
    family: "'Unbounded Variable'",
    load: () => import('@fontsource-variable/unbounded/wght.css'),
  },
  geologica: {
    family: "'Geologica Variable'",
    load: () => import('@fontsource-variable/geologica/wght.css'),
  },
  'playfair-display': {
    family: "'Playfair Display Variable'",
    load: () => import('@fontsource-variable/playfair-display/wght.css'),
  },
}

const BODY_FONTS: Record<
  BodyFont,
  { family: string; load: () => Promise<unknown> }
> = {
  onest: {
    family: "'Onest Variable'",
    load: () => import('@fontsource-variable/onest/wght.css'),
  },
  inter: {
    family: "'Inter Variable'",
    load: () => import('@fontsource-variable/inter/wght.css'),
  },
  commissioner: {
    family: "'Commissioner Variable'",
    load: () => import('@fontsource-variable/commissioner/wght.css'),
  },
}

export const DEFAULT_FONTS: FontChoice = { heading: 'unbounded', body: 'onest' }

export function loadFonts({ heading, body }: FontChoice) {
  const h = HEADING_FONTS[heading] ?? HEADING_FONTS[DEFAULT_FONTS.heading]
  const b = BODY_FONTS[body] ?? BODY_FONTS[DEFAULT_FONTS.body]
  const root = document.documentElement
  root.style.setProperty('--heading-family', h.family)
  root.style.setProperty('--body-family', b.family)
  void h.load()
  void b.load()
}
