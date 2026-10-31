import { m, useMotionValue, useSpring } from 'motion/react'
import { type PointerEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetServicesQuery } from '../../api/publicApi'
import type { Service } from '../../api/types'
import { useIsTouch } from '../../hooks/useIsTouch'
import { useLocalized } from '../../hooks/useLocale'
import { ServiceIcon } from '../../lib/icons'
import { RevealGroup, RevealItem } from '../motion/Reveal'
import { Container } from '../ui/Container'
import { SectionHeading } from './SectionHeading'

export function Services({ index }: { index: number }) {
  const { t } = useTranslation()
  const { data: services = [] } = useGetServicesQuery()
  if (!services.length) return null

  return (
    <section id="services" className="py-section">
      <Container>
        <SectionHeading
          index={index}
          label={t('sections.services')}
          title={t('services.heading')}
        />
        <RevealGroup className="grid gap-px overflow-hidden rounded-sm border border-fg/10 bg-fg/10 md:grid-cols-2">
          {services.map((s, i) => (
            <RevealItem key={s._id} className="h-full">
              <ServiceCard service={s} number={i + 1} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  )
}

/** Card with a soft spotlight that follows the cursor (transform only). */
function ServiceCard({
  service,
  number,
}: {
  service: Service
  number: number
}) {
  const l = useLocalized()
  const isTouch = useIsTouch()
  const [hover, setHover] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 30 })
  const sy = useSpring(y, { stiffness: 300, damping: 30 })

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
  }

  return (
    <article
      className="group relative isolate flex h-full min-h-80 flex-col justify-between overflow-hidden bg-background p-8 md:min-h-96 md:p-12"
      onPointerMove={isTouch ? undefined : onMove}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {!isTouch && (
        <m.div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 -z-10 size-[32rem] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--primary)/0.28),transparent_65%)]"
          style={{ x: sx, y: sy }}
          animate={{ opacity: hover ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
      <div className="flex items-start justify-between">
        <ServiceIcon
          name={service.icon}
          className="size-8 text-primary"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="font-heading text-h2 text-fg/10 transition-colors duration-500 group-hover:text-fg/30">
          {String(number).padStart(2, '0')}
        </span>
      </div>
      <div>
        <h3 className="text-h3">{l(service.title)}</h3>
        <p className="mt-4 max-w-md text-fg/60">{l(service.description)}</p>
      </div>
    </article>
  )
}
