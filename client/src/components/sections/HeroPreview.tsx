import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { Hero } from '../../api/types'
import { useLocalized } from '../../hooks/useLocale'
import { scrollToTarget } from '../../lib/lenis'
import { EASE } from '../../lib/motion'
import { MagneticButton } from '../motion/MagneticButton'
import { Marquee } from '../motion/Marquee'
import { Reveal } from '../motion/Reveal'
import { SplitText } from '../motion/SplitText'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'

/**
 * Phase 3 skeleton of the hero: real content + the motion system.
 * The full section (video background, overlay…) is built in Phase 4.
 */
export function HeroPreview({
  hero,
  siteName,
}: {
  hero: Hero
  siteName: string
}) {
  const { t } = useTranslation()
  const l = useLocalized()
  const eyebrow = l(hero.eyebrow)

  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col justify-end pt-32"
    >
      <Container className="pb-16 md:pb-24">
        {eyebrow && (
          <Reveal delay={0.1} className="mb-8 text-label text-fg/60">
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
                href={hero.cta.href.startsWith('#') ? undefined : hero.cta.href}
                onClick={() => scrollToTarget(hero.cta.href)}
              >
                {l(hero.cta.label)}
              </Button>
            </MagneticButton>
          </Reveal>
        </div>
      </Container>

      <div className="border-y border-fg/10 py-4">
        <Marquee speed={50}>
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className="flex items-center gap-8 pr-8 text-label text-fg/60"
            >
              <span>{siteName}</span>
              <span className="text-primary">✶</span>
              <span>{eyebrow || t('sections.work')}</span>
              <span className="text-primary">✶</span>
            </span>
          ))}
        </Marquee>
      </div>

      <m.button
        onClick={() => scrollToTarget(window.innerHeight)}
        className="absolute right-gutter bottom-28 hidden flex-col items-center gap-3 text-label text-fg/60 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        aria-label={t('common.scroll')}
      >
        <span className="[writing-mode:vertical-rl]">{t('common.scroll')}</span>
        <span className="relative h-16 w-px overflow-hidden bg-fg/20">
          <m.span
            className="absolute inset-x-0 top-0 h-1/2 bg-primary"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: EASE.inOut }}
          />
        </span>
      </m.button>
    </section>
  )
}
