import { type MouseEvent, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useGetProjectsQuery } from '../../api/publicApi'
import type { ProjectCard } from '../../api/types'
import { useGsap } from '../../hooks/useGsap'
import { useLocalePath, useLocalized } from '../../hooks/useLocale'
import { setCoverOrigin } from '../../lib/shared-cover'
import { Container } from '../ui/Container'
import { Img } from '../ui/Img'
import { SectionHeading } from './SectionHeading'

/** Desktop with a fine pointer: pinned horizontal scroll. Touch / small / reduced motion: vertical list. */
const PIN_QUERY =
  '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

export function Work({ index }: { index: number }) {
  const { t } = useTranslation()
  const { data: featured = [], isSuccess } = useGetProjectsQuery({
    featured: true,
  })
  const { data: all = [] } = useGetProjectsQuery(undefined, {
    skip: !isSuccess || featured.length > 0,
  })
  const projects = featured.length ? featured : all
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGsap(
    ({ gsap }) => {
      const mm = gsap.matchMedia()
      mm.add(PIN_QUERY, () => {
        const track = trackRef.current
        const pin = pinRef.current
        if (!track || !pin) return
        const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth)
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      })
    },
    [projects.length],
    sectionRef,
  )

  if (!projects.length) return null

  return (
    <section id="work" ref={sectionRef} className="pt-section">
      <Container>
        <SectionHeading
          index={index}
          label={t('sections.work')}
          title={t('work.heading')}
        />
      </Container>
      <div
        ref={pinRef}
        className="pb-section lg:pointer-fine:motion-safe:flex lg:pointer-fine:motion-safe:h-svh lg:pointer-fine:motion-safe:items-center lg:pointer-fine:motion-safe:overflow-hidden lg:pointer-fine:motion-safe:pb-0"
      >
        <div
          ref={trackRef}
          className="flex flex-col gap-16 px-gutter lg:pointer-fine:motion-safe:w-max lg:pointer-fine:motion-safe:flex-row lg:pointer-fine:motion-safe:gap-10"
        >
          {projects.map((p, i) => (
            <WorkCard key={p._id} project={p} number={i + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function WorkCard({
  project,
  number,
}: {
  project: ProjectCard
  number: number
}) {
  const l = useLocalized()
  const path = useLocalePath()
  const navigate = useNavigate()
  const coverRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const to = path(`/work/${project.slug}`)

  const open = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return // let the browser open a new tab
    e.preventDefault()
    if (coverRef.current)
      setCoverOrigin(coverRef.current.getBoundingClientRect())
    void navigate(to, { state: { fromCard: true } })
  }

  return (
    <Link
      to={to}
      onClick={open}
      data-cursor="view"
      className="group block lg:pointer-fine:motion-safe:w-[min(62vw,46rem)]"
      onPointerEnter={() =>
        void videoRef.current?.play().catch(() => undefined)
      }
      onPointerLeave={() => {
        const v = videoRef.current
        if (!v) return
        v.pause()
        v.currentTime = 0
      }}
    >
      <div
        ref={coverRef}
        className="relative aspect-[4/3] overflow-hidden rounded-sm"
      >
        <Img
          media={project.cover}
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="h-full w-full"
          imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
        />
        {project.coverVideo && (
          <video
            ref={videoRef}
            src={project.coverVideo.url}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <span className="absolute top-5 left-5 rounded-full bg-background/70 px-3 py-1.5 text-label backdrop-blur">
          {String(number).padStart(2, '0')}
        </span>
      </div>
      <div className="mt-6 flex items-start justify-between gap-6">
        <div>
          <h3 className="text-h3 transition-colors duration-300 group-hover:text-primary">
            {l(project.title)}
          </h3>
          <p className="mt-2 text-fg/60">
            {project.client} — {l(project.category)}
          </p>
        </div>
        <span className="text-label text-fg/50">{project.year}</span>
      </div>
    </Link>
  )
}
