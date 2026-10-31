import type { ReactNode } from 'react'
import { SplitText } from '../motion/SplitText'
import { SectionLabel } from '../ui/SectionLabel'

/** Numbered label + big split heading that opens a section. `*word*` gets the marker. */
export function SectionHeading({
  index,
  label,
  title,
  aside,
}: {
  index: number
  label: string
  title: string
  aside?: ReactNode
}) {
  return (
    <>
      <SectionLabel index={index}>{label}</SectionLabel>
      <div className="mb-14 flex flex-wrap items-end justify-between gap-8 md:mb-24">
        <SplitText as="h2" text={title} className="max-w-[16ch] text-h1" />
        {aside}
      </div>
    </>
  )
}
