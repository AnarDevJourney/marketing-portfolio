import { m } from 'motion/react'
import { type MouseEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useGetBootstrapQuery, useGetProjectsQuery } from '../../api/publicApi'
import {
  PROJECT_GROUPS,
  type ProjectCard,
  type ProjectGroup,
} from '../../api/types'
import { useGsap } from '../../hooks/useGsap'
import { useLocalePath, useLocalized } from '../../hooks/useLocale'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { EASE } from '../../lib/motion'
import { setCoverOrigin } from '../../lib/shared-cover'
import { Container } from '../ui/Container'
import { Img } from '../ui/Img'
import { SectionHeading } from './SectionHeading'

/** Desktop with a fine pointer: pinned horizontal scroll. Touch / small / reduced motion: vertical list. */
const PIN_QUERY =
  '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

const groupOf = (p: ProjectCard): ProjectGroup => p.group ?? 'primary'

/** Last chosen tab — survives a visit to a case study and back (SPA navigation). */
let lastGroup: ProjectGroup = 'primary'

export function Work({ index }: { index: number }) {
  const { t } = useTranslation()
  const l = useLocalized()
  const { data: boot } = useGetBootstrapQuery()
  const { data: featured = [], isSuccess } = useGetProjectsQuery({
    featured: true,
  })
  const { data: all = [] } = useGetProjectsQuery(undefined, {
    skip: !isSuccess || featured.length > 0,
  })
  const shown = featured.length ? featured : all
  const [group, setGroupState] = useState<ProjectGroup>(lastGroup)
  // Opening a card remembers its group, so "back to work" lands on the same tab.
  const setGroup = (g: ProjectGroup) => {
    lastGroup = g
    setGroupState(g)
  }
  const pickTab = (g: ProjectGroup) => {
    if (g === group) return
    setSwitched(true)
    setGroup(g)
  }
  // Tabs only when enabled in the admin and both groups have something to show.
  const workGroups = boot?.settings.workGroups
  const grouped =
    !!workGroups?.enabled &&
    PROJECT_GROUPS.every((g) => shown.some((p) => groupOf(p) === g))
  const projects = grouped ? shown.filter((p) => groupOf(p) === group) : shown
  const [switched, setSwitched] = useState(false)
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
    // Rebuilt on tab change: the track width (and pin length) depends on the cards.
    [projects.length, grouped ? group : null],
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
          aside={
            grouped &&
            workGroups && (
              <GroupTabs
                value={group}
                onChange={pickTab}
                options={PROJECT_GROUPS.map((g) => ({
                  value: g,
                  label: l(workGroups[g]),
                  count: shown.filter((p) => groupOf(p) === g).length,
                }))}
              />
            )
          }
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
            <WorkCard
              key={p._id}
              project={p}
              number={i + 1}
              // Cards of a newly picked tab slide in; nothing animates on first load.
              enterDelay={switched ? i * 0.08 : null}
              onOpen={() => setGroup(groupOf(p))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function WorkCard({
  project,
  number,
  enterDelay,
  onOpen,
}: {
  project: ProjectCard
  number: number
  /** Seconds; null = render without an entrance animation. */
  enterDelay: number | null
  onOpen: () => void
}) {
  const l = useLocalized()
  const reduced = useReducedMotion()
  const path = useLocalePath()
  const navigate = useNavigate()
  const coverRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const to = path(`/work/${project.slug}`)

  const open = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return // let the browser open a new tab
    e.preventDefault()
    onOpen()
    if (coverRef.current)
      setCoverOrigin(coverRef.current.getBoundingClientRect())
    void navigate(to, { state: { fromCard: true } })
  }

  const animateIn = enterDelay !== null && !reduced
  return (
    <m.div
      initial={animateIn ? { opacity: 0, x: 60 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: EASE.outExpo, delay: enterDelay ?? 0 }}
    >
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
    </m.div>
  )
}

/** Pill switch between the two work groups; the active pill slides (layoutId). */
function GroupTabs({
  value,
  onChange,
  options,
}: {
  value: ProjectGroup
  onChange: (g: ProjectGroup) => void
  options: { value: ProjectGroup; label: string; count: number }[]
}) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  return (
    <div
      role="tablist"
      aria-label={t('work.groups')}
      className="grid w-full grid-cols-2 gap-1 rounded-[1.75rem] border border-fg/15 p-1 sm:flex sm:w-auto sm:rounded-full"
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`relative rounded-3xl px-3 py-2.5 text-sm leading-tight transition-colors duration-300 sm:rounded-full sm:px-5 md:px-6 md:py-3 ${active ? 'text-background' : 'text-fg/70 hover:text-fg'}`}
          >
            {active && (
              <m.span
                layoutId="work-group-pill"
                className="absolute inset-0 rounded-3xl bg-fg sm:rounded-full"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.6, ease: EASE.outExpo }
                }
                aria-hidden
              />
            )}
            <span className="relative">
              {o.label}
              <sup className="ml-1 text-[0.65em] opacity-60">
                {String(o.count).padStart(2, '0')}
              </sup>
            </span>
          </button>
        )
      })}
    </div>
  )
}
