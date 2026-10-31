import type { ColorKey, FontChoice } from '../api/types'
import { loadFonts } from './fonts'

export type ThemeColors = Record<ColorKey, string>

interface ThemeCache {
  colors: ThemeColors
  font: FontChoice
}

const CACHE_KEY = 'theme-cache'

/** "#ff5a36" -> "255 90 54" (so Tailwind opacity modifiers like bg-primary/20 work). */
export function hexToRgbTriplet(hex: string) {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ')
}

/** Writes colors to CSS variables, loads fonts and caches both for the next visit (see index.html). */
export function applyTheme(colors: ThemeColors, font: FontChoice) {
  const root = document.documentElement
  for (const [key, hex] of Object.entries(colors)) {
    root.style.setProperty(`--${key}`, hexToRgbTriplet(hex))
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', colors.background)
  loadFonts(font)
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ colors, font } satisfies ThemeCache),
    )
  } catch {
    // storage unavailable (private mode) — theme still applies for this visit
  }
}

export function readThemeCache(): ThemeCache | null {
  try {
    return JSON.parse(
      localStorage.getItem(CACHE_KEY) ?? 'null',
    ) as ThemeCache | null
  } catch {
    return null
  }
}
