import { useState } from 'react'
import { Counter } from '../../components/motion/Counter'
import { Highlight } from '../../components/motion/Highlight'
import { MagneticButton } from '../../components/motion/MagneticButton'
import { Marquee } from '../../components/motion/Marquee'
import { Parallax } from '../../components/motion/Parallax'
import { Reveal, RevealGroup, RevealItem } from '../../components/motion/Reveal'
import { SplitText } from '../../components/motion/SplitText'
import { Button } from '../../components/ui/Button'
import { Container } from '../../components/ui/Container'
import { SectionLabel } from '../../components/ui/SectionLabel'

const COLORS = [
  ['background', 'bg-background'],
  ['surface', 'bg-surface'],
  ['text', 'bg-fg'],
  ['primary', 'bg-primary'],
  ['accent', 'bg-accent'],
] as const

const TYPE = [
  ['text-display', 'Siqnal'],
  ['text-h1', 'Səs-küydən keçən'],
  ['text-h2', 'Şəffaf nəticələr'],
  ['text-h3', 'Ölçülə bilən böyümə — Измеримый рост'],
  ['text-lead', 'Brendlər üçün strategiya, kontent və performans marketinqi.'],
  ['text-label', '(01) — Label'],
] as const

/** Living style guide (dev only): tokens, type scale and motion components. */
export default function DesignPage() {
  const [vars] = useState(() => {
    const style = getComputedStyle(document.documentElement)
    return Object.fromEntries(
      COLORS.map(([k]) => [k, style.getPropertyValue(`--${k}`)]),
    )
  })

  return (
    <Container className="pt-40 pb-section">
      <SplitText
        as="h1"
        text="Design *system*"
        immediate
        className="text-display"
      />
      <p className="mt-8 max-w-xl text-lead text-fg/60">
        "Signal" — docs/design/DIRECTION.md
      </p>

      <section className="mt-section">
        <SectionLabel index={1}>Colors</SectionLabel>
        <RevealGroup className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {COLORS.map(([name, cls]) => (
            <RevealItem key={name}>
              <div
                className={`aspect-square rounded-sm border border-fg/10 ${cls}`}
              />
              <p className="mt-3 text-sm">{name}</p>
              <p className="text-xs text-fg/50">rgb({vars[name]})</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="mt-section">
        <SectionLabel index={2}>Typography</SectionLabel>
        <div className="flex flex-col gap-10">
          {TYPE.map(([cls, sample]) => (
            <Reveal key={cls} className="border-b border-fg/10 pb-8">
              <p className="mb-3 text-xs text-fg/40">{cls}</p>
              <p
                className={`${cls} ${cls === 'text-lead' || cls === 'text-label' ? '' : 'font-heading'}`}
              >
                {sample}
              </p>
            </Reveal>
          ))}
          <p className="text-lead">
            Əə Ğğ Iı İi Şş Çç Öö Üü — Жж Щщ Ёё — 0123456789
          </p>
        </div>
      </section>

      <section className="mt-section">
        <SectionLabel index={3}>Motion</SectionLabel>
        <SplitText
          as="h2"
          text="Brendləri *hekayəyə* çevirirəm"
          className="text-h1"
        />
        <p className="mt-10 font-heading text-h3">
          Reach <Highlight>+240%</Highlight> in three months
        </p>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          <div>
            <Counter to={8} suffix="+" className="font-heading text-h1" />
            <p className="text-fg/60">years</p>
          </div>
          <div>
            <Counter to={120} suffix="+" className="font-heading text-h1" />
            <p className="text-fg/60">campaigns</p>
          </div>
          <div>
            <Counter to={4.8} prefix="★ " className="font-heading text-h1" />
            <p className="text-fg/60">rating</p>
          </div>
        </div>
        <div className="-mx-gutter mt-16 border-y border-fg/10 py-6">
          <Marquee>
            {['Strategy', 'SMM', 'Branding', 'Performance', 'Content'].map(
              (w) => (
                <span
                  key={w}
                  className="flex items-center gap-10 pr-10 font-heading text-h2"
                >
                  {w} <span className="text-primary">✶</span>
                </span>
              ),
            )}
          </Marquee>
        </div>
        <div className="mt-16 flex flex-wrap gap-6">
          <MagneticButton>
            <Button>Primary</Button>
          </MagneticButton>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div
            data-cursor="view"
            className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm bg-surface"
          >
            <Parallax speed={0.3}>
              <span className="font-heading text-h2 text-fg/30">
                Parallax · cursor
              </span>
            </Parallax>
          </div>
          <div
            data-cursor="drag"
            className="flex aspect-[4/3] items-center justify-center rounded-sm bg-primary text-background"
          >
            <span className="font-heading text-h2">data-cursor</span>
          </div>
        </div>
      </section>
    </Container>
  )
}
