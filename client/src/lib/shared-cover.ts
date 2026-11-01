/**
 * Hand-off for the "cover grows into the case study hero" transition:
 * the work card stores its cover's screen rect on click, the project page
 * reads it on mount and animates from there (FLIP, transform only).
 *
 * Reading does not consume the rect: effects may run twice (StrictMode, or a
 * dependency change mid-animation) and the second run must still find it.
 * It is cleared once the animation finishes, and ignored when stale so a later
 * page visit never animates from an old card position.
 */
const MAX_AGE_MS = 1500

let origin: { rect: DOMRect; at: number } | null = null

export function setCoverOrigin(rect: DOMRect) {
  origin = { rect, at: performance.now() }
}

export function getCoverOrigin(): DOMRect | null {
  if (origin && performance.now() - origin.at > MAX_AGE_MS) origin = null
  return origin?.rect ?? null
}

export function clearCoverOrigin() {
  origin = null
}
