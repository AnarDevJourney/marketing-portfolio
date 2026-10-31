/** Shared easing curves (docs/design/DIRECTION.md). */
export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const

/** whileInView settings: animate once, when a fifth of the element is visible. */
export const VIEWPORT = { once: true, amount: 0.2 } as const
