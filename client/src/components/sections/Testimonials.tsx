import { AnimatePresence, m, type PanInfo } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetTestimonialsQuery } from '../../api/publicApi'
import { useLocalized } from '../../hooks/useLocale'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { EASE } from '../../lib/motion'
import { Container } from '../ui/Container'
import { Img } from '../ui/Img'
import { SectionHeading } from './SectionHeading'

/** One big quote at a time; drag/swipe or use the arrows. */
export function Testimonials({ index }: { index: number }) {
  const { t } = useTranslation()
  const l = useLocalized()
  const reduced = useReducedMotion()
  const { data: items = [] } = useGetTestimonialsQuery()
  const [[current, direction], setState] = useState<[number, number]>([0, 1])
  if (!items.length) return null

  const go = (dir: number) =>
    setState(([i]) => [(i + dir + items.length) % items.length, dir])
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -500) go(1)
    else if (info.offset.x > 80 || info.velocity.x > 500) go(-1)
  }
  const item = items[current]
  const offset = reduced ? 0 : 60

  return (
    <section id="testimonials" className="py-section">
      <Container>
        <SectionHeading
          index={index}
          label={t('sections.testimonials')}
          title={t('testimonials.heading')}
        />

        <m.div
          className="relative min-h-[22rem] cursor-grab touch-pan-y active:cursor-grabbing md:min-h-[26rem]"
          data-cursor={items.length > 1 ? 'drag' : undefined}
          drag={items.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={onDragEnd}
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <m.figure
              key={item._id}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * offset }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: -d * offset }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: EASE.outQuart }}
            >
              <blockquote className="max-w-[28ch] font-heading text-h2">
                <span className="text-primary">“</span>
                {l(item.quote)}
                <span className="text-primary">”</span>
              </blockquote>
              <figcaption className="mt-12 flex items-center gap-5">
                {item.avatar && (
                  <Img
                    media={item.avatar}
                    sizes="64px"
                    className="size-14 shrink-0 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{item.author}</p>
                  <p className="text-sm text-fg/60">
                    {l(item.role)}
                    {item.company && ` — ${item.company}`}
                  </p>
                </div>
              </figcaption>
            </m.figure>
          </AnimatePresence>
        </m.div>

        {items.length > 1 && (
          <div className="mt-12 flex items-center justify-between border-t border-fg/10 pt-6">
            <span className="text-label text-fg/60 tabular-nums">
              {String(current + 1).padStart(2, '0')} /{' '}
              {String(items.length).padStart(2, '0')}
            </span>
            <div className="flex gap-3">
              {[
                [-1, '←', t('testimonials.prev')],
                [1, '→', t('testimonials.next')],
              ].map(([dir, arrow, label]) => (
                <button
                  key={label}
                  onClick={() => go(dir as number)}
                  aria-label={label as string}
                  className="flex size-14 items-center justify-center rounded-full border border-fg/20 text-lg transition-colors duration-300 hover:border-primary hover:bg-primary hover:text-background"
                >
                  {arrow}
                </button>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}
