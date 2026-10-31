import { useTranslation } from 'react-i18next'
import { MagneticButton } from '../../components/motion/MagneticButton'
import { Reveal } from '../../components/motion/Reveal'
import { SplitText } from '../../components/motion/SplitText'
import { Button } from '../../components/ui/Button'
import { Container } from '../../components/ui/Container'
import { useLocalePath } from '../../hooks/useLocale'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const path = useLocalePath()
  return (
    <Container className="flex min-h-svh flex-col justify-center pt-32 pb-16">
      <SplitText
        as="p"
        text="4 *0* 4"
        immediate
        className="font-heading text-[clamp(8rem,30vw,28rem)] leading-[0.8] tracking-[-0.06em]"
      />
      <div className="mt-12 flex flex-wrap items-end justify-between gap-10">
        <Reveal delay={0.4} className="max-w-xl">
          <h1 className="text-h2">{t('notFound.title')}</h1>
          <p className="mt-4 text-lead text-fg/60">{t('notFound.text')}</p>
        </Reveal>
        <Reveal delay={0.6}>
          <MagneticButton>
            <Button href={path('/')}>{t('notFound.home')}</Button>
          </MagneticButton>
        </Reveal>
      </div>
    </Container>
  )
}
