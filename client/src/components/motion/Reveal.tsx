import { m, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { EASE, VIEWPORT } from '../../lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** Initial vertical offset in px. */
  y?: number
}

/** Fades + slides its content in when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: RevealProps) {
  const reduced = useReducedMotion()
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: reduced ? 0.4 : 0.8, ease: EASE.outQuart, delay }}
    >
      {children}
    </m.div>
  )
}

const groupVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

/** Container that reveals its <RevealItem> children one after another. */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
}) {
  return (
    <m.div
      className={className}
      variants={groupVariants(stagger, delay)}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
    >
      {children}
    </m.div>
  )
}

export function RevealItem({
  children,
  className,
  y = 24,
}: {
  children: ReactNode
  className?: string
  y?: number
}) {
  const reduced = useReducedMotion()
  return (
    <m.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : y },
        shown: {
          opacity: 1,
          y: 0,
          transition: { duration: reduced ? 0.4 : 0.8, ease: EASE.outQuart },
        },
      }}
    >
      {children}
    </m.div>
  )
}
