import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { SplitText } from '../../components/motion/SplitText'
import { Button } from '../../components/ui/Button'
import { Container } from '../../components/ui/Container'
import { useLocalePath } from '../../hooks/useLocale'

/** Case study page — skeleton; built in Phase 4. */
export default function ProjectPage() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const path = useLocalePath()
  return (
    <Container className="flex min-h-svh flex-col justify-center gap-10 pt-32">
      <span className="text-label text-fg/60">{t('sections.work')}</span>
      <SplitText
        as="h1"
        text={slug.replace(/-/g, ' ')}
        immediate
        className="text-h1"
      />
      <div>
        <Button href={path('/')} variant="outline">
          {t('nav.home')}
        </Button>
      </div>
    </Container>
  )
}
