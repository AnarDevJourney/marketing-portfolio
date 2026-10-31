/**
 * Hand-off for the "cover grows into the case study hero" transition:
 * the work card stores its cover's screen rect on click, the project page
 * reads it once on mount and animates from there (FLIP, transform only).
 */
let origin: DOMRect | null = null

export function setCoverOrigin(rect: DOMRect) {
  origin = rect
}

export function takeCoverOrigin() {
  const rect = origin
  origin = null
  return rect
}
