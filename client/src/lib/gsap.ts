/** GSAP + ScrollTrigger, loaded on demand so they stay out of the initial bundle. */
let gsapPromise: Promise<GsapBundle> | undefined

export type GsapBundle = {
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

/**
 * Resolves once the browser is idle after the first render, so scroll effects never
 * compete with the initial paint (LCP) for the main thread.
 */
const whenIdle = () =>
  new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window)
      requestIdleCallback(() => resolve(), { timeout: 2000 })
    else setTimeout(resolve, 300)
  })

export function loadGsap(): Promise<GsapBundle> {
  gsapPromise ??= whenIdle().then(() =>
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger)
        return { gsap, ScrollTrigger }
      },
    ),
  )
  return gsapPromise
}
