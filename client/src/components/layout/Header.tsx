import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useScroll,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router'
import type { Locale, SectionKey, Settings } from '../../api/types'
import {
  LOCALE_STORAGE_KEY,
  localePath,
  stripLocale,
  useLocale,
  useLocalePath,
  useLocalized,
} from '../../hooks/useLocale'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { scrollToTarget, setScrollLocked } from '../../lib/lenis'
import { imageProps } from '../../lib/media'
import { EASE } from '../../lib/motion'
import { Container } from '../ui/Container'

const NAV_SECTIONS: SectionKey[] = ['work', 'about', 'services', 'contact']

/** Top bar: hides on scroll down, returns on scroll up; opens a full-screen menu. */
export function Header({
  settings,
  sections,
}: {
  settings: Settings
  sections: SectionKey[]
}) {
  const { t } = useTranslation()
  const l = useLocalized()
  const path = useLocalePath()
  const { locale, defaultLocale, enabled } = useLocale()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const links = NAV_SECTIONS.filter((key) => sections.includes(key))
  const isHome = stripLocale(pathname) === '/'

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 160)
  })

  useEffect(() => {
    setScrollLocked(open)
    if (!open) return
    // Keyboard users land in the menu; closing returns focus to the toggle.
    const toggle = toggleRef.current
    const id = setTimeout(
      () => menuRef.current?.querySelector<HTMLElement>('nav button')?.focus(),
      50,
    )
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(id)
      window.removeEventListener('keydown', onKey)
      toggle?.focus({ preventScroll: true })
    }
  }, [open])

  const goTo = (key: SectionKey) => {
    setOpen(false)
    if (isHome) scrollToTarget(`#${key}`)
    else void navigate(`${path('/')}#${key}`)
  }

  const switchLocale = (next: Locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // ignore
    }
    setOpen(false)
    void navigate(localePath(stripLocale(pathname), next, defaultLocale))
  }

  return (
    <>
      <m.header
        className="fixed inset-x-0 top-0 z-50 mix-blend-difference"
        animate={{ y: hidden && !open ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE.outQuart }}
      >
        <Container className="flex h-20 items-center justify-between md:h-24">
          <Link
            to={path('/')}
            className="font-heading text-lg tracking-tight text-fg"
            aria-label={settings.siteName}
          >
            {settings.logo ? (
              <img
                {...imageProps(settings.logo, locale, defaultLocale, '160px')}
                className="h-7 w-auto"
                alt={settings.siteName}
              />
            ) : (
              settings.siteName
            )}
          </Link>

          <nav
            className={`hidden items-center gap-10 transition-opacity duration-300 md:flex ${open ? 'pointer-events-none opacity-0' : ''}`}
            aria-label={t('menu.mainNav')}
            aria-hidden={open}
          >
            {links.map((key) => (
              <button
                key={key}
                onClick={() => goTo(key)}
                className="group relative text-sm text-fg"
              >
                {t(`nav.${key}`)}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-fg transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {enabled.length > 1 && (
              <div
                className="hidden gap-3 text-label md:flex"
                role="group"
                aria-label={t('menu.language')}
              >
                {enabled.map((code) => (
                  <button
                    key={code}
                    onClick={() => switchLocale(code)}
                    aria-current={code === locale}
                    className={
                      code === locale
                        ? 'text-fg'
                        : 'text-fg/55 transition-colors hover:text-fg'
                    }
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}
            <button
              ref={toggleRef}
              onClick={() => setOpen((o) => !o)}
              // -my-4 py-4: a ~44px tap target without moving the bar's layout
              className="-my-4 flex items-center gap-3 py-4 text-label text-fg"
              aria-expanded={open}
              aria-controls="site-menu"
            >
              <span>{open ? t('menu.close') : t('menu.open')}</span>
              <span className="relative block h-2.5 w-6" aria-hidden>
                <span
                  className={`absolute left-0 h-px w-full bg-fg transition-transform duration-500 ease-out-expo ${open ? 'top-1/2 rotate-45' : 'top-0'}`}
                />
                <span
                  className={`absolute left-0 h-px w-full bg-fg transition-transform duration-500 ease-out-expo ${open ? 'top-1/2 -rotate-45' : 'bottom-0'}`}
                />
              </span>
            </button>
          </div>
        </Container>
      </m.header>

      <AnimatePresence>
        {open && (
          <m.div
            ref={menuRef}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t('menu.menuNav')}
            className="fixed inset-0 z-40 flex flex-col bg-surface pt-28"
            initial={
              reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }
            }
            animate={
              reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }
            }
            exit={
              reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }
            }
            transition={{ duration: 0.8, ease: EASE.inOut }}
          >
            <Container className="flex flex-1 flex-col justify-between pb-gutter">
              <nav aria-label={t('menu.menuNav')}>
                <ul className="flex flex-col">
                  {links.map((key, i) => (
                    <li
                      key={key}
                      className="overflow-hidden border-b border-fg/10"
                    >
                      <m.button
                        onClick={() => goTo(key)}
                        className="group flex w-full items-baseline gap-6 py-4 text-left md:py-6"
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        transition={{
                          duration: 0.9,
                          ease: EASE.outExpo,
                          delay: 0.25 + i * 0.07,
                        }}
                      >
                        <span className="text-label text-primary">
                          0{i + 1}
                        </span>
                        <span className="font-heading text-h1 transition-transform duration-700 ease-out-expo group-hover:translate-x-4">
                          {t(`nav.${key}`)}
                        </span>
                      </m.button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="flex flex-wrap items-end justify-between gap-8 pt-10 text-sm text-fg/60">
                <div className="flex flex-col gap-2">
                  <a
                    href={`mailto:${settings.contact.email}`}
                    className="text-fg hover:text-primary"
                  >
                    {settings.contact.email}
                  </a>
                  <span>{l(settings.contact.location)}</span>
                </div>
                {enabled.length > 1 && (
                  <div className="flex gap-4 text-label">
                    {enabled.map((code) => (
                      <button
                        key={code}
                        onClick={() => switchLocale(code)}
                        className={
                          code === locale ? 'text-primary' : 'hover:text-fg'
                        }
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Container>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
