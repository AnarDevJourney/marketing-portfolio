import { type DependencyList, type RefObject, useEffect } from 'react'
import { type GsapBundle, loadGsap } from '../lib/gsap'

/**
 * Runs GSAP code inside a gsap.context() scoped to `scope` and reverts it on
 * unmount / deps change (same cleanup guarantee as @gsap/react's useGSAP, but
 * GSAP is loaded lazily so it isn't in the initial bundle).
 */
export function useGsap(
  setup: (lib: GsapBundle) => void,
  deps: DependencyList,
  scope?: RefObject<Element | null>,
) {
  useEffect(() => {
    let ctx: { revert: () => void } | undefined
    let cancelled = false
    void loadGsap().then((lib) => {
      if (cancelled) return
      ctx = lib.gsap.context(() => setup(lib), scope?.current ?? undefined)
    })
    return () => {
      cancelled = true
      ctx?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps)
}
