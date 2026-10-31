import { useTranslation } from 'react-i18next'
import type { SectionKey } from '../../api/types'
import { Reveal } from '../motion/Reveal'
import { SplitText } from '../motion/SplitText'
import { Container } from '../ui/Container'
import { SectionLabel } from '../ui/SectionLabel'

/** Phase 3 stand-in for a section: shows the rhythm (label, heading, spacing). Replaced in Phase 4. */
export function SectionPlaceholder({
  id,
  index,
}: {
  id: SectionKey
  index: number
}) {
  const { t } = useTranslation()
  return (
    <section id={id} className="py-section">
      <Container>
        <SectionLabel index={index}>{t(`sections.${id}`)}</SectionLabel>
        <SplitText as="h2" text={t(`sections.${id}`)} className="text-h1" />
        <Reveal
          delay={0.2}
          className="mt-10 h-48 rounded-sm border border-dashed border-fg/15 md:h-72"
        >
          <span className="flex h-full items-center justify-center text-label text-fg/30">
            {t('common.comingSoon')}
          </span>
        </Reveal>
      </Container>
    </section>
  )
}
