import { m } from 'motion/react'
import { useEffect, useState } from 'react'
import { EASE } from '../../lib/motion'
import { markPreloaderSeen } from '../../lib/preloader'
import { easing, tween } from '../../lib/tween'

/**
 * First-visit intro (≤1.2s, once per session): counts 0→100 next to the
 * site name, then lifts away. `ready` holds it at 100 until data has loaded.
 */
export function Preloader({
  name,
  ready,
  onDone,
}: {
  name: string
  ready: boolean
  onDone: () => void
}) {
  const [count, setCount] = useState(0)
  const [counted, setCounted] = useState(false)

  useEffect(() => {
    return tween(0, 100, {
      duration: 1.1,
      ease: easing.inOutCubic,
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => setCounted(true),
    })
  }, [])

  const leaving = counted && ready

  return (
    <m.div
      className="fixed inset-0 z-[80] flex flex-col justify-between bg-surface p-gutter"
      initial={{ y: 0 }}
      animate={leaving ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 0.9, ease: EASE.inOut }}
      onAnimationComplete={() => {
        if (!leaving) return
        markPreloaderSeen()
        onDone()
      }}
    >
      <span className="text-label text-fg/60">{name}</span>
      <div className="flex items-end justify-between gap-6">
        <span className="font-heading text-h2 text-fg">{name}</span>
        <span className="font-heading text-display text-primary tabular-nums">
          {count}
        </span>
      </div>
    </m.div>
  )
}
