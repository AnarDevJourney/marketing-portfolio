import { m } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { EASE, VIEWPORT } from '../../lib/motion'

/**
 * The site's signature: a marker stroke in the primary color drawn behind
 * a word, left to right, like underlining the key number in a pitch deck.
 */
export function Highlight({
  children,
  delay = 0.3,
}: {
  children: ReactNode
  delay?: number
}) {
  const reduced = useReducedMotion()
  return (
    // The wrapper detects visibility: the marker itself starts at scaleX(0),
    // a zero-area box that IntersectionObserver never reports as in view.
    // `inherit={false}` keeps SplitText's variant labels from driving it.
    <m.span
      className="relative isolate inline-block whitespace-nowrap"
      inherit={false}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
    >
      <m.span
        aria-hidden
        className="absolute inset-x-[-0.06em] bottom-[0.06em] -z-10 h-[0.42em] origin-left rounded-[0.08em] bg-primary"
        // skew via Motion: it owns `transform`, so a Tailwind skew class would be overwritten
        style={{ skewX: -6 }}
        variants={{
          hidden: { scaleX: reduced ? 1 : 0 },
          shown: {
            scaleX: 1,
            transition: { duration: 0.9, ease: EASE.outExpo, delay },
          },
        }}
      />
      {children}
    </m.span>
  )
}
