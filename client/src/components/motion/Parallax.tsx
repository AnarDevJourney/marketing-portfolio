import { type ReactNode, useRef } from 'react'
import { useGsap } from '../../hooks/useGsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface ParallaxProps {
  children: ReactNode
  className?: string
  /** Positive = moves slower than scroll (drifts up), negative = faster. ~0.1–0.3 looks natural. */
  speed?: number
}

/** Scroll-scrubbed vertical drift (GSAP ScrollTrigger). */
export function Parallax({ children, className, speed = 0.2 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGsap(
    ({ gsap }) => {
      if (reduced || !ref.current) return
      gsap.fromTo(
        ref.current,
        { yPercent: speed * 50 },
        {
          yPercent: -speed * 50,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    },
    [reduced, speed],
    ref,
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
