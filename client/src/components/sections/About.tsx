import { m, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { About as AboutData } from '../../api/types'
import { useLocalized } from '../../hooks/useLocale'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { renderMarkdown } from '../../lib/markdown'
import { Counter } from '../motion/Counter'
import { Parallax } from '../motion/Parallax'
import { Reveal, RevealGroup, RevealItem } from '../motion/Reveal'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { Img } from '../ui/Img'
import { SectionHeading } from './SectionHeading'

export function About({ about, index }: { about: AboutData; index: number }) {
  const { t } = useTranslation()
  const l = useLocalized()
  const reduced = useReducedMotion()
  const timelineRef = useRef<HTMLOListElement>(null)
  // The timeline's line is drawn as you scroll through it.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 75%', 'end 60%'],
  })
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section id="about" className="py-section">
      <Container>
        <SectionHeading
          index={index}
          label={t('sections.about')}
          title={l(about.heading)}
        />

        <div className="grid gap-16 md:grid-cols-12 md:gap-10">
          {about.photo && (
            <div className="md:col-span-5">
              <div className="overflow-hidden rounded-sm">
                <Parallax speed={0.15} className="scale-110">
                  <Img
                    media={about.photo}
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="aspect-[4/5]"
                  />
                </Parallax>
              </div>
            </div>
          )}
          <div
            className={
              about.photo ? 'md:col-span-6 md:col-start-7' : 'md:col-span-8'
            }
          >
            <Reveal className="flex flex-col gap-6 text-lead text-fg/70">
              {renderMarkdown(l(about.bio))}
            </Reveal>
            {about.cv && (
              <Reveal delay={0.2} className="mt-10">
                <Button href={about.cv.url} variant="outline">
                  {t('about.cv')} ↓
                </Button>
              </Reveal>
            )}

            {about.stats.length > 0 && (
              <RevealGroup className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-fg/10 pt-12">
                {about.stats.map((s, i) => (
                  <RevealItem key={i}>
                    <Counter
                      to={s.value}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      className="block font-heading text-h2"
                    />
                    <span className="mt-3 block text-sm text-fg/60">
                      {l(s.label)}
                    </span>
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>
        </div>

        {about.timeline.length > 0 && (
          <div className="mt-section grid gap-10 md:grid-cols-12">
            <h3 className="text-label text-fg/60 md:col-span-4">
              {t('about.experience')}
            </h3>
            <ol ref={timelineRef} className="relative md:col-span-8">
              <span
                className="absolute top-0 left-0 h-full w-px bg-fg/10"
                aria-hidden
              />
              <m.span
                className="absolute top-0 left-0 h-full w-px origin-top bg-primary"
                style={{ scaleY: reduced ? 1 : lineScale }}
                aria-hidden
              />
              {about.timeline.map((item, i) => (
                <li key={i} className="relative pb-12 pl-10 last:pb-0">
                  <span
                    className="absolute top-2 -left-[3.5px] size-2 rounded-full bg-primary"
                    aria-hidden
                  />
                  <Reveal>
                    <p className="text-label text-fg/50">{item.period}</p>
                    <p className="mt-3 font-heading text-h3">{l(item.title)}</p>
                    <p className="mt-1 text-fg/60">{item.company}</p>
                    {l(item.description) && (
                      <p className="mt-3 max-w-xl text-fg/60">
                        {l(item.description)}
                      </p>
                    )}
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Container>
    </section>
  )
}
