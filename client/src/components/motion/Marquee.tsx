import { m, useAnimationFrame, useMotionValue } from 'motion/react'
import { type ReactNode, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface MarqueeProps {
  children: ReactNode
  /** Pixels per second. Negative scrolls right. */
  speed?: number
  /** Speed multiplier while hovered. */
  hoverSpeed?: number
  className?: string
}

/** Endless horizontal row that eases down to a slower speed on hover. */
export function Marquee({
  children,
  speed = 60,
  hoverSpeed = 0.2,
  className,
}: MarqueeProps) {
  const x = useMotionValue(0)
  const track = useRef<HTMLDivElement>(null)
  const factor = useRef(1)
  const target = useRef(1)
  const reduced = useReducedMotion()

  useAnimationFrame((_, delta) => {
    const width = track.current ? track.current.scrollWidth / 2 : 0
    if (reduced || !width) return
    factor.current += (target.current - factor.current) * 0.06
    let next = x.get() - (speed * factor.current * delta) / 1000
    // wrap within one copy's width so the loop is seamless
    if (next <= -width) next += width
    if (next > 0) next -= width
    x.set(next)
  })

  return (
    <div
      className={`overflow-hidden ${className ?? ''}`}
      onPointerEnter={() => (target.current = hoverSpeed)}
      onPointerLeave={() => (target.current = 1)}
    >
      <m.div ref={track} className="flex w-max" style={{ x }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </m.div>
    </div>
  )
}
