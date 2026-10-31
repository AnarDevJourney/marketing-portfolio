import { AnimatePresence, m, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

/**
 * Custom cursor: a small accent dot plus a trailing ring. Over elements with
 * `data-cursor="view"` (or any i18n key under "cursor.") the ring becomes a
 * labelled pill. Only mounted on non-touch devices.
 */
export function Cursor() {
  const { t } = useTranslation()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 350, damping: 32, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 350, damping: 32, mass: 0.5 })
  const { pathname } = useLocation()
  // remember which page the label belongs to: after navigation it's stale until the mouse moves
  const [hint, setHint] = useState<{ label: string; path: string } | null>(null)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('has-custom-cursor')
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const target = e.target instanceof Element ? e.target : null
      const labelled = target?.closest<HTMLElement>('[data-cursor]')
      setHint(
        labelled?.dataset.cursor
          ? { label: labelled.dataset.cursor, path: window.location.pathname }
          : null,
      )
      setHovering(
        !!target?.closest('a, button, [role="button"], label, summary'),
      )
    }
    const onLeave = () => setVisible(false)
    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [x, y])

  const label = hint?.path === pathname ? hint.label : null
  const text = label ? t(`cursor.${label}`, { defaultValue: label }) : null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <m.div
        className="absolute top-0 left-0 size-1.5 -translate-1/2 rounded-full bg-accent"
        style={{ x, y }}
        animate={{ scale: text ? 0 : 1 }}
      />
      <m.div className="absolute top-0 left-0" style={{ x: ringX, y: ringY }}>
        <m.div
          className="flex -translate-1/2 items-center justify-center rounded-full border border-accent/60 text-label whitespace-nowrap text-background"
          animate={
            text
              ? {
                  width: 96,
                  height: 96,
                  backgroundColor: 'rgb(var(--accent))',
                  borderColor: 'rgb(var(--accent))',
                }
              : {
                  width: hovering ? 56 : 32,
                  height: hovering ? 56 : 32,
                  backgroundColor: 'rgb(var(--accent) / 0)',
                }
          }
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        >
          <AnimatePresence>
            {text && (
              <m.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
              >
                {text}
              </m.span>
            )}
          </AnimatePresence>
        </m.div>
      </m.div>
    </div>
  )
}
