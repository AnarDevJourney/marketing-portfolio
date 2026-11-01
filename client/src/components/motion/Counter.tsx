import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../hooks/useLocale'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { tween } from '../../lib/tween'

interface CounterProps {
  to: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

/** Counts from 0 to `to` when it enters the viewport. */
export function Counter({
  to,
  prefix = '',
  suffix = '',
  duration = 2,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduced = useReducedMotion()
  const { locale } = useLocale()
  const [value, setValue] = useState(reduced ? to : 0)
  const decimals = Number.isInteger(to) ? 0 : 1

  useEffect(() => {
    if (!inView || reduced) return
    return tween(0, to, { duration, onUpdate: setValue })
  }, [inView, reduced, to, duration])

  const format = new Intl.NumberFormat(locale, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  })
  const final = `${prefix}${format.format(to)}${suffix}`
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {/* aria-label isn't allowed on a plain span: screen readers get the final value as text. */}
      <span className="sr-only">{final}</span>
      <span aria-hidden>
        {prefix}
        {format.format(reduced ? to : value)}
        {suffix}
      </span>
    </span>
  )
}
