import { createContext, useCallback, useContext } from 'react'
import type { Locale, LocalizedString } from '../api/types'
import { localize } from '../lib/localized'

export interface LocaleInfo {
  locale: Locale
  defaultLocale: Locale
  enabled: Locale[]
}

export const LocaleContext = createContext<LocaleInfo>({
  locale: 'az',
  defaultLocale: 'az',
  enabled: ['az', 'en', 'ru'],
})

export function useLocale() {
  return useContext(LocaleContext)
}

/** `l(value)` returns the text of a LocalizedString in the current language (with fallback). */
export function useLocalized() {
  const { locale, defaultLocale } = useLocale()
  return useCallback(
    (value: LocalizedString | undefined | null) =>
      localize(value, locale, defaultLocale),
    [locale, defaultLocale],
  )
}

/** Builds a site path for a locale: the default locale has no prefix ("/work/x"), others do ("/en/work/x"). */
export function localePath(
  path: string,
  locale: Locale,
  defaultLocale: Locale,
) {
  const clean = path === '/' ? '' : path
  return locale === defaultLocale ? clean || '/' : `/${locale}${clean}`
}

export function useLocalePath() {
  const { locale, defaultLocale } = useLocale()
  return useCallback(
    (path: string) => localePath(path, locale, defaultLocale),
    [locale, defaultLocale],
  )
}

export const LOCALE_STORAGE_KEY = 'locale'

/** Path without the locale prefix: "/en/work/x" -> "/work/x". */
export function stripLocale(pathname: string) {
  return pathname.replace(/^\/(az|en|ru)(?=\/|$)/, '') || '/'
}
