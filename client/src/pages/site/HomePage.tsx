import { lazy, type ReactNode, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router'
import { useGetBootstrapQuery } from '../../api/publicApi'
import type { SectionKey } from '../../api/types'
import { About } from '../../components/sections/About'
import { Hero } from '../../components/sections/Hero'
import { SITE_URL, useSeo } from '../../hooks/useSeo'
import { useLocale } from '../../hooks/useLocale'
import { scrollToTarget } from '../../lib/lenis'
import { homePage } from '../../lib/seo'

// Sections that can open the page (Hero, About) are in the main bundle; the rest load
// as separate chunks right after, keeping the JS before the first paint small.
const loaders = {
  clients: () => import('../../components/sections/Clients'),
  services: () => import('../../components/sections/Services'),
  work: () => import('../../components/sections/Work'),
  testimonials: () => import('../../components/sections/Testimonials'),
  contact: () => import('../../components/sections/Contact'),
}
const Clients = lazy(() =>
  loaders.clients().then((m) => ({ default: m.Clients })),
)
const Services = lazy(() =>
  loaders.services().then((m) => ({ default: m.Services })),
)
const Work = lazy(() => loaders.work().then((m) => ({ default: m.Work })))
const Testimonials = lazy(() =>
  loaders.testimonials().then((m) => ({ default: m.Testimonials })),
)
const Contact = lazy(() =>
  loaders.contact().then((m) => ({ default: m.Contact })),
)

/**
 * "/#contact" on arrival: sections above the target still load their chunks and
 * data, which moves it. Wait for the chunks, then until the target's position has
 * been stable for ~300ms (max 3s), then scroll.
 */
function scrollWhenSettled(hash: string) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let cancelled = false
  let last = Number.NaN
  let stable = 0
  let tries = 0
  const tick = () => {
    const el = document.getElementById(decodeURIComponent(hash.slice(1)))
    const top = el
      ? el.getBoundingClientRect().top + window.scrollY
      : Number.NaN
    stable = top === last ? stable + 1 : 0
    last = top
    if ((el && stable >= 3) || ++tries > 30) {
      if (el) scrollToTarget(el)
      return
    }
    timer = setTimeout(tick, 100)
  }
  void Promise.allSettled(Object.values(loaders).map((load) => load())).then(
    () => {
      if (!cancelled) tick()
    },
  )
  return () => {
    cancelled = true
    clearTimeout(timer)
  }
}

/** Keeps the section's anchor (#work, …) in place while its chunk loads. */
function Deferred({ id, children }: { id: SectionKey; children: ReactNode }) {
  return (
    <Suspense fallback={<div id={id} className="min-h-svh" />}>
      {children}
    </Suspense>
  )
}

/** One-page home: sections in the order (and on/off state) configured in the admin. */
export default function HomePage() {
  const { data } = useGetBootstrapQuery()
  const { hash } = useLocation()
  const { locale, defaultLocale } = useLocale()
  useSeo((boot) => homePage(boot, locale, defaultLocale, SITE_URL))

  // Arriving via "/#work" (or a direct link): scroll once the page is in place.
  useEffect(() => {
    if (!hash || hash === '#main') return
    return scrollWhenSettled(hash)
  }, [hash])

  if (!data) return null
  // Section numbers "(01)…" count the sections after the hero.
  const numbered: SectionKey[] = data.sections.filter((k) => k !== 'hero')
  const index = (key: SectionKey) => numbered.indexOf(key) + 1

  return (
    <>
      {data.sections.map((key) => {
        switch (key) {
          case 'hero':
            return <Hero key={key} hero={data.hero} />
          case 'clients':
            return (
              <Deferred key={key} id={key}>
                <Clients index={index(key)} />
              </Deferred>
            )
          case 'about':
            return (
              <About
                key={key}
                about={data.about}
                index={index(key)}
                first={data.sections[0] === key}
              />
            )
          case 'services':
            return (
              <Deferred key={key} id={key}>
                <Services index={index(key)} />
              </Deferred>
            )
          case 'work':
            return (
              <Deferred key={key} id={key}>
                <Work index={index(key)} />
              </Deferred>
            )
          case 'testimonials':
            return (
              <Deferred key={key} id={key}>
                <Testimonials index={index(key)} />
              </Deferred>
            )
          case 'contact':
            return (
              <Deferred key={key} id={key}>
                <Contact settings={data.settings} index={index(key)} />
              </Deferred>
            )
        }
      })}
    </>
  )
}
