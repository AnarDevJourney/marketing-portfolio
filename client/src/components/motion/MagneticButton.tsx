import { m, useMotionValue, useSpring } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'
import { useIsTouch } from '../../hooks/useIsTouch'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface MagneticProps {
  children: ReactNode
  className?: string
  /** Share of the pointer offset the element follows (0–1). */
  strength?: number
}

/** Wrapper that pulls its content toward the cursor and springs back on leave. */
export function MagneticButton({
  children,
  className,
  strength = 0.3,
}: MagneticProps) {
  const isTouch = useIsTouch()
  const reduced = useReducedMotion()
  const disabled = isTouch || reduced
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 220, damping: 18, mass: 0.6 }
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * strength)
    y.set((e.clientY - rect.top - rect.height / 2) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div
      className={`inline-block ${className ?? ''}`}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </m.div>
  )
}
