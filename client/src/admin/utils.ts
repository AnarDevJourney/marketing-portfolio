import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { LocalizedString, Media } from '../api/types'

export const LOCALE_LABELS = { az: 'AZ', en: 'EN', ru: 'RU' } as const

export const emptyLs = (): LocalizedString => ({ az: '', en: '', ru: '' })

/** Media field value in forms is the populated object; the API wants the id. */
export function toId(media: Media | string | null | undefined): string | null {
  if (!media) return null
  return typeof media === 'string' ? media : media._id
}

const TRANSLIT: Record<string, string> = {
  ə: 'e',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ç: 'c',
  ü: 'u',
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ы: 'y',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  ъ: '',
  ь: '',
}

/** "Lumo Coffee rebrendinqi" -> "lumo-coffee-rebrendinqi" (Azerbaijani and Russian letters transliterated). */
export function slugify(text: string) {
  return text
    .toLocaleLowerCase('az')
    .replace(/./g, (ch) => TRANSLIT[ch] ?? ch)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function contrastRatio(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [0, 2, 4].map((i) => {
      const c = parseInt(hex.replace('#', '').slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Human-readable message from an RTK Query error (server sends { message }). */
export function errorMessage(err: unknown, fallback = 'Xəta baş verdi') {
  const e = err as FetchBaseQueryError & {
    data?: { message?: string | string[] }
  }
  if (e?.status === 429)
    return 'Çox sayda cəhd. Bir az gözləyib yenidən yoxlayın.'
  if (e?.status === 'FETCH_ERROR') return 'Serverə qoşulmaq alınmadı.'
  const msg = e?.data?.message
  return Array.isArray(msg) ? msg.join('; ') : (msg ?? fallback)
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Public site URL for "View on site" links. */
export const SITE_URL = '/'
