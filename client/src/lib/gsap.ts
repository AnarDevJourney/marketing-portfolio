/** GSAP + ScrollTrigger, loaded on demand so they stay out of the initial bundle. */
let gsapPromise: Promise<GsapBundle> | undefined

export type GsapBundle = {
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

export function loadGsap(): Promise<GsapBundle> {
  gsapPromise ??= Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger)
    return { gsap, ScrollTrigger }
  })
  return gsapPromise
}
