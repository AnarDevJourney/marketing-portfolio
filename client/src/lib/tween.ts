/** Easing functions matching the design curves closely (docs/design/DIRECTION.md). */
export const easing = {
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
}

/**
 * Minimal requestAnimationFrame tween for numbers (counters). Avoids pulling
 * Motion's full animation engine into the initial bundle. Returns a stop function.
 */
export function tween(
  from: number,
  to: number,
  {
    duration,
    ease = easing.outExpo,
    onUpdate,
    onComplete,
  }: {
    duration: number
    ease?: (t: number) => number
    onUpdate: (value: number) => void
    onComplete?: () => void
  },
) {
  let frame = 0
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min((now - start) / (duration * 1000), 1)
    onUpdate(from + (to - from) * ease(t))
    if (t < 1) frame = requestAnimationFrame(step)
    else onComplete?.()
  }
  frame = requestAnimationFrame(step)
  return () => cancelAnimationFrame(frame)
}
