import { animate } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { useGetBootstrapQuery, useGetProjectQuery } from '../../api/publicApi'
import type { ProjectDetail } from '../../api/types'
import { Counter } from '../../components/motion/Counter'
import { Reveal, RevealGroup, RevealItem } from '../../components/motion/Reveal'
import { SplitText } from '../../components/motion/SplitText'
import { Container } from '../../components/ui/Container'
import { Img } from '../../components/ui/Img'
import { Lightbox } from '../../components/ui/Lightbox'
import { SectionLabel } from '../../components/ui/SectionLabel'
import { useLocalePath, useLocalized } from '../../hooks/useLocale'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { scrollToTarget } from '../../lib/lenis'
import { plainText } from '../../lib/localized'
import { renderMarkdown } from '../../lib/markdown'
import { EASE } from '../../lib/motion'
import { clearCoverOrigin, getCoverOrigin } from '../../lib/shared-cover'
import NotFoundPage from './NotFoundPage'

export default function ProjectPage() {
  const { slug = '' } = useParams()
  const { data, isError } = useGetProjectQuery(slug)
  if (isError) return <NotFoundPage />
  if (!data) return <div className="min-h-svh" />
  return <ProjectView key={data._id} project={data} />
}

function ProjectView({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation()
  const l = useLocalized()
  const path = useLocalePath()
  const reduced = useReducedMotion()
  const { data: boot } = useGetBootstrapQuery()
  const coverRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const title = l(project.title)

  // Cover "grows" from the work card that was clicked (FLIP: transform only).
  useLayoutEffect(() => {
    const from = getCoverOrigin()
    const el = coverRef.current
    if (!from || !el || reduced) {
      clearCoverOrigin()
      return
    }
    scrollToTarget(0, { immediate: true })
    window.scrollTo(0, 0)
    const to = el.getBoundingClientRect()
    el.style.transformOrigin = '0 0'
    const controls = animate(
      el,
      {
        x: [from.left - to.left, 0],
        y: [from.top - to.top, 0],
        scaleX: [from.width / to.width, 1],
        scaleY: [from.height / to.height, 1],
      },
      { duration: 1, ease: EASE.outExpo, onComplete: clearCoverOrigin },
    )
    // An interrupted run (StrictMode re-run, unmount) must not leave the cover
    // frozen at the card's position: stop and drop the inline transform.
    return () => {
      controls.stop()
      el.style.transform = ''
      el.style.transformOrigin = ''
    }
  }, [reduced])

  useEffect(() => {
    if (boot) document.title = `${plainText(title)} — ${boot.settings.siteName}`
  }, [boot, title])

  const meta: [string, string][] = [
    [t('project.client'), project.client],
    [t('project.year'), String(project.year)],
    [t('project.category'), l(project.category)],
  ]

  return (
    <article>
      <Container className="pt-36 md:pt-44">
        <Reveal>
          <Link
            to={`${path('/')}#work`}
            className="text-label text-fg/50 hover:text-primary"
          >
            ← {t('project.back')}
          </Link>
        </Reveal>
        <SplitText
          as="h1"
          text={title}
          immediate
          delay={0.1}
          className="mt-8 max-w-[18ch] text-h1"
        />
        <Reveal
          delay={0.4}
          className="mt-12 grid grid-cols-2 gap-6 border-t border-fg/10 pt-6 md:grid-cols-4"
        >
          {meta.map(([label, value]) => (
            <div key={label}>
              <p className="text-label text-fg/50">{label}</p>
              <p className="mt-2">{value}</p>
            </div>
          ))}
        </Reveal>
      </Container>

      <Container className="mt-12 md:mt-16">
        <div ref={coverRef} className="overflow-hidden rounded-sm">
          <Img
            media={project.cover}
            priority
            sizes="100vw"
            className="aspect-[16/10] md:aspect-[16/8]"
          />
        </div>
      </Container>

      <Container className="py-section">
        <Reveal className="max-w-3xl font-heading text-h3">
          {l(project.summary)}
        </Reveal>

        <div className="mt-section grid gap-16 md:grid-cols-2 md:gap-10">
          {(
            [
              ['challenge', project.challenge],
              ['solution', project.solution],
            ] as const
          ).map(([key, text], i) => (
            <Reveal key={key} delay={i * 0.1}>
              <p className="mb-6 text-label text-primary">
                ({String(i + 1).padStart(2, '0')}) {t(`project.${key}`)}
              </p>
              <div className="flex flex-col gap-5 text-lead text-fg/70">
                {renderMarkdown(l(text))}
              </div>
            </Reveal>
          ))}
        </div>

        {project.results.length > 0 && (
          <div className="mt-section">
            <SectionLabel index={3}>{t('project.results')}</SectionLabel>
            <RevealGroup className="grid gap-px overflow-hidden rounded-sm border border-fg/10 bg-fg/10 sm:grid-cols-2 lg:grid-cols-3">
              {project.results.map((r, i) => (
                <RevealItem key={i} className="bg-background p-8 md:p-12">
                  <Counter
                    to={r.value}
                    prefix={r.prefix}
                    suffix={r.suffix}
                    className="block font-heading text-h1 text-primary"
                  />
                  <p className="mt-4 text-fg/60">{l(r.label)}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        )}

        {project.gallery.length > 0 && (
          <div className="mt-section">
            <SectionLabel index={4}>{t('project.gallery')}</SectionLabel>
            <div className="columns-1 gap-6 md:columns-2">
              {project.gallery.map((g, i) => (
                <Reveal key={g._id} className="mb-6 break-inside-avoid">
                  <button
                    onClick={() => setLightbox(i)}
                    data-cursor="open"
                    className="group block w-full overflow-hidden rounded-sm"
                  >
                    <Img
                      media={g}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
                    />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </Container>

      {project.next && (
        <Link
          to={path(`/work/${project.next.slug}`)}
          data-cursor="open"
          className="group relative flex h-[80svh] items-end overflow-hidden"
        >
          <Img
            media={project.next.cover}
            sizes="100vw"
            className="absolute inset-0 -z-10 h-full w-full"
            imgClassName="transition-transform duration-[1.6s] ease-out-expo group-hover:scale-105"
          />
          <div className="absolute inset-0 -z-10 bg-background/60 transition-colors duration-700 group-hover:bg-background/40" />
          <Container className="pb-16">
            <p className="text-label text-fg/70">{t('project.next')} →</p>
            <p className="mt-6 max-w-[16ch] font-heading text-display">
              {l(project.next.title)}
            </p>
          </Container>
        </Link>
      )}

      <Lightbox
        images={project.gallery}
        index={lightbox}
        onChange={setLightbox}
      />
    </article>
  )
}
