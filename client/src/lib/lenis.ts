import type Lenis from 'lenis'
import { loadGsap } from './gsap'

let lenis: Lenis | null = null

/** Starts Lenis smooth scrolling driven by GSAP's ticker. Returns a stop function. */
export async function startLenis() {
  const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([
    import('lenis'),
    loadGsap(),
  ])
  const instance = new LenisCtor({ lerp: 0.1 })
  instance.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  lenis = instance

  return () => {
    gsap.ticker.remove(tick)
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

/** Scrolls to a target via Lenis when active, natively otherwise. */
export function scrollToTarget(
  target: string | number | HTMLElement,
  { immediate = false, offset = 0 } = {},
) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, offset, duration: 1.4 })
    return
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior: ScrollBehavior = immediate || reduce ? 'instant' : 'smooth'
  if (typeof target === 'number') {
    window.scrollTo({ top: target + offset, behavior })
    return
  }
  const el =
    typeof target === 'string' ? document.querySelector(target) : target
  if (el)
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY + offset,
      behavior,
    })
}

/** Freezes page scrolling (e.g. while the full-screen menu is open). */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
