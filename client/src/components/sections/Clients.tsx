import { useTranslation } from 'react-i18next'
import { useGetClientsQuery } from '../../api/publicApi'
import { useLocale } from '../../hooks/useLocale'
import { imageProps } from '../../lib/media'
import { Marquee } from '../motion/Marquee'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'

/** Endless logo row: slows down on hover, the hovered logo turns to full color. */
export function Clients({ index }: { index: number }) {
  const { t } = useTranslation()
  const { locale, defaultLocale } = useLocale()
  const { data: clients = [] } = useGetClientsQuery()
  if (!clients.length) return null

  return (
    <section id="clients" className="py-section">
      <Container>
        <SectionLabel index={index}>{t('sections.clients')}</SectionLabel>
        <p className="mb-12 max-w-md text-lead text-fg/60">
          {t('clients.heading')}
        </p>
      </Container>
      <Marquee speed={45} className="border-y border-fg/10 py-10 md:py-14">
        {clients.map((c) => {
          const img = (
            <img
              {...imageProps(c.logo, locale, defaultLocale, '240px')}
              alt={c.name}
              loading="lazy"
              className="h-12 w-auto max-w-[13rem] object-contain opacity-50 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 md:h-20"
            />
          )
          return (
            <div
              key={c._id}
              className="group flex shrink-0 items-center px-10 md:px-16"
            >
              {c.website ? (
                <a
                  href={c.website}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={c.name}
                >
                  {img}
                </a>
              ) : (
                img
              )}
            </div>
          )
        })}
      </Marquee>
    </section>
  )
}
