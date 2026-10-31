import { m } from 'motion/react'
import { type ReactNode, useEffect } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { scrollToTarget } from '../../lib/lenis'
import { EASE } from '../../lib/motion'

let firstMount = true

interface PageTransitionProps {
  children: ReactNode
  label: string
  /**
   * Skip the curtain (the page does its own transition, e.g. a work card's
   * cover growing into the case study). Pass the same value as
   * <AnimatePresence custom>, so the *exiting* page also sees the latest value.
   */
  skip?: boolean
}

/**
 * Route transition "curtain": on exit a primary-colored panel rises over the
 * old page; the new page mounts underneath and the panel lifts away.
 * Must be the direct child of <AnimatePresence mode="wait"> with a route key.
 */
export function PageTransition({
  children,
  label,
  skip = false,
}: PageTransitionProps) {
  const reduced = useReducedMotion()
  const showIntro = !firstMount && !skip && !reduced

  useEffect(() => {
    firstMount = false
    if (!window.location.hash) scrollToTarget(0, { immediate: true })
  }, [])

  return (
    <>
      <m.div
        variants={{
          shown: { opacity: 1 },
          exit: (s: boolean) =>
            s || reduced
              ? { opacity: 0, transition: { duration: 0.35 } }
              : // stay visible under the curtain; the duration keeps AnimatePresence waiting for it
                { opacity: 1, transition: { duration: 0.6 } },
        }}
        initial={reduced ? { opacity: 0 } : false}
        animate="shown"
        exit="exit"
      >
        {children}
      </m.div>

      {!reduced && (
        // covers the old page on exit
        <m.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[75] origin-bottom bg-primary"
          variants={{
            shown: { scaleY: 0 },
            exit: (s: boolean) =>
              s
                ? { scaleY: 0, transition: { duration: 0 } }
                : {
                    scaleY: 1,
                    transition: { duration: 0.6, ease: EASE.inOut },
                  },
          }}
          initial={false}
          animate="shown"
          exit="exit"
        />
      )}

      {showIntro && (
        // reveals the new page on enter
        <m.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[75] flex origin-top items-center justify-center bg-primary"
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
