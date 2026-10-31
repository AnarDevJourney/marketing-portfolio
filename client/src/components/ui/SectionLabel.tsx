import { Reveal } from '../motion/Reveal'

/** "(03) — Services" index line that opens every section, with a hairline. */
export function SectionLabel({
  index,
  children,
}: {
  index: number
  children: string
}) {
  return (
    <Reveal className="mb-12 flex items-center gap-4 border-t border-fg/10 pt-5 text-label text-fg/60 md:mb-20">
      <span className="text-primary">({String(index).padStart(2, '0')})</span>
      <span aria-hidden>—</span>
      <span>{children}</span>
    </Reveal>
  )
}
