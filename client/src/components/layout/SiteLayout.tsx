import { AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useOutlet, useParams } from 'react-router'
import { useGetBootstrapQuery } from '../../api/publicApi'
import { LOCALES, type Locale } from '../../api/types'
import { useIsTouch } from '../../hooks/useIsTouch'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import {
  LOCALE_STORAGE_KEY,
  LocaleContext,
  localePath,
  stripLocale,
} from '../../hooks/useLocale'
import NotFoundPage from '../../pages/site/NotFoundPage'
import { applyTheme } from '../../theme/applyTheme'
import { Button } from '../ui/Button'
import { Cursor } from './Cursor'
import { Footer } from './Footer'
import { Header } from './Header'
import { PageTransition } from './PageTransition'
import { hasSeenPreloader } from '../../lib/preloader'
import { Preloader } from './Preloader'
import { SmoothScroll } from './SmoothScroll'

function storedLocale(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY)
  } catch {
    return null
  }
}

/** Public site shell: loads bootstrap data, resolves the locale, applies the theme, renders chrome + routes. */
export function SiteLayout() {
  const { t, i18n } = useTranslation()
  const { lang } = useParams()
  const location = useLocation()
  const outlet = useOutlet()
  const isTouch = useIsTouch()
  const reduced = useReducedMotion()
  const { data, isError, refetch } = useGetBootstrapQuery()
  const [showPreloader, setShowPreloader] = useState(() => !hasSeenPreloader())

  const settings = data?.settings
  const defaultLocale = settings?.locales.default ?? 'az'
  const enabled = settings?.locales.enabled ?? [...LOCALES]
  const langValid = !lang || enabled.includes(lang as Locale)
  const locale = (lang && langValid ? lang : defaultLocale) as Locale

  useEffect(() => {
    if (settings) applyTheme(settings.colors, settings.font)
  }, [settings])

  useEffect(() => {
    void i18n.changeLanguage(locale)
    document.documentElement.lang = locale
  }, [i18n, locale])

  if (isError) {
    return (
      <main className="flex min-h-svh flex-col items-start justify-center gap-6 px-gutter">
        <h1 className="text-h2">{t('error.title')}</h1>
        <p className="text-fg/60">{t('error.text')}</p>
        <Button onClick={() => void refetch()} variant="outline">
          {t('common.retry')}
        </Button>
      </main>
    )
  }

  // Returning visitor who picked another language: no prefix -> their language.
  const stored = storedLocale()
  if (
    settings &&
    !lang &&
    stored &&
    stored !== defaultLocale &&
    enabled.includes(stored as Locale)
  ) {
    return (
      <Navigate
        replace
        to={
          localePath(
            stripLocale(location.pathname),
            stored as Locale,
            defaultLocale,
          ) + location.hash
        }
      />
    )
  }

  // The intro and the custom cursor are pure motion: off with "reduce motion".
  const preloader = showPreloader &&
    !reduced &&
    (!settings || settings.features.preloader) && (
      <Preloader
        name={settings?.siteName ?? ''}
        ready={!!data}
        onDone={() => setShowPreloader(false)}
      />
    )
  if (!data || !settings) return preloader || null
  const fromCard =
    (location.state as { fromCard?: boolean } | null)?.fromCard === true

  return (
    <LocaleContext.Provider value={{ locale, defaultLocale, enabled }}>
      <SmoothScroll enabled={settings.features.smoothScroll} />
      {settings.features.customCursor && !isTouch && !reduced && <Cursor />}
      {preloader}
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-fg px-5 py-3 text-sm text-background focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {t('common.skipToContent')}
      </a>
      <Header settings={settings} sections={data.sections} />
      <AnimatePresence mode="wait" custom={fromCard}>
        <PageTransition
          key={stripLocale(location.pathname)}
          label={settings.siteName}
          skip={fromCard}
        >
          <main id="main" tabIndex={-1} className="outline-none">
            {langValid ? outlet : <NotFoundPage />}
          </main>
          <Footer settings={settings} />
        </PageTransition>
      </AnimatePresence>
    </LocaleContext.Provider>
  )
}
