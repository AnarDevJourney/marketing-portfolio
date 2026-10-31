import { m } from 'motion/react'
import { type ReactNode, useEffect } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { scrollToTarget } from '../../lib/lenis'
import { EASE } from '../../lib/motion'

let firstMount = true

/**
 * Route transition "curtain": on exit a primary-colored panel rises over the
 * old page; the new page mounts underneath and the panel lifts away.
 * Must be the direct child of <AnimatePresence mode="wait"> with a route key.
 */
export function PageTransition({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  const reduced = useReducedMotion()
  const skipIntro = firstMount

  useEffect(() => {
    firstMount = false
    if (!window.location.hash) scrollToTarget(0, { immediate: true })
  }, [])

  if (reduced) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </m.div>
    )
  }

  return (
    <>
      {children}
      {/* covers the old page on exit */}
      <m.div
        aria-hidden
        className="fixed inset-0 z-[75] origin-bottom bg-primary"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.6, ease: EASE.inOut }}
      />
      {/* reveals the new page on enter */}
      {!skipIntro && (
        <m.div
          aria-hidden
          className="fixed inset-0 z-[75] flex origin-top items-center justify-center bg-primary"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.7, ease: EASE.inOut, delay: 0.15 }}
        >
          <m.span
            className="font-heading text-h2 text-background"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </m.span>
        </m.div>
      )}
    </>
  )
}
