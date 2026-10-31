import { useEffect } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { startLenis } from '../../lib/lenis'

/** Enables Lenis smooth scrolling unless the user prefers reduced motion. */
export function SmoothScroll({ enabled }: { enabled: boolean }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!enabled || reduced) return
    let stop: (() => void) | undefined
    let cancelled = false
    startLenis()
      .then((s) => (cancelled ? s() : (stop = s)))
      // smooth scroll is an enhancement: if it fails to load, native scrolling stays
      .catch(() => undefined)
    return () => {
      cancelled = true
      stop?.()
    }
  }, [enabled, reduced])

  return null
}
