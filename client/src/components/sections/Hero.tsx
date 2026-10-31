import { m } from 'motion/react'
import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import type { Hero as HeroData } from '../../api/types'
import { useLocalized } from '../../hooks/useLocale'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { scrollToTarget } from '../../lib/lenis'
import { EASE } from '../../lib/motion'
import { MagneticButton } from '../motion/MagneticButton'
import { Reveal } from '../motion/Reveal'
import { SplitText } from '../motion/SplitText'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { Img } from '../ui/Img'

/** Small screens and data-saver mode get the poster instead of the video. */
function useLightMode() {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia('(max-width: 767px)')
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    () =>
      window.matchMedia('(max-width: 767px)').matches ||
      !!(navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData,
    () => true,
  )
}

export function Hero({ hero }: { hero: HeroData }) {
  const { t } = useTranslation()
  const l = useLocalized()
  const reduced = useReducedMotion()
  const light = useLightMode()
  const { type, media, poster, overlayOpacity } = hero.background
  const eyebrow = l(hero.eyebrow)
  const hasBackground = type !== 'none' && !!media
  const href = hero.cta.href
  const internalAnchor = href.startsWith('#')

  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden pt-32"
    >
      {hasBackground && (
        <div className="absolute inset-0 -z-10">
          {type === 'video' && !light && !reduced ? (
            <video
              className="h-full w-full object-cover"
              src={media.url}
              poster={poster?.url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          ) : (
            <Img
              media={type === 'video' ? (poster ?? media) : media}
              priority
              className="h-full w-full"
            />
          )}
          <div
            className="absolute inset-0 bg-background"
            style={{ opacity: overlayOpacity }}
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-background to-transparent" />
        </div>
      )}

      <Container className="pb-16 md:pb-24">
        {eyebrow && (
          <Reveal
            delay={0.1}
            className="mb-8 flex items-center gap-3 text-label text-fg/60"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            {eyebrow}
          </Reveal>
        )}
        <SplitText
          as="h1"
          text={l(hero.title)}
          immediate
          delay={0.2}
          className="max-w-[14ch] text-display"
        />
        <div className="mt-12 flex flex-wrap items-end justify-between gap-10">
          {l(hero.subtitle) && (
            <Reveal delay={0.6} className="max-w-md text-lead text-fg/70">
              {l(hero.subtitle)}
            </Reveal>
          )}
          <Reveal delay={0.8}>
            <MagneticButton>
              <Button
                href={internalAnchor ? undefined : href}
                onClick={
                  internalAnchor ? () => scrollToTarget(href) : undefined
                }
              >
                {l(hero.cta.label)}
              </Button>
            </MagneticButton>
          </Reveal>
        </div>
      </Container>

      <m.button
        onClick={() => scrollToTarget(window.innerHeight)}
        className="absolute right-gutter bottom-24 hidden flex-col items-center gap-3 text-label text-fg/60 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        aria-label={t('common.scroll')}
      >
        <span className="[writing-mode:vertical-rl]">{t('common.scroll')}</span>
        <span className="relative h-16 w-px overflow-hidden bg-fg/20">
          <m.span
            className="absolute inset-x-0 top-0 h-1/2 bg-primary"
            animate={reduced ? undefined : { y: ['-100%', '200%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: EASE.inOut }}
          />
        </span>
      </m.button>
    </section>
  )
}
