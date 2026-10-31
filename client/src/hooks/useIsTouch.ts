import { useSyncExternalStore } from 'react'

const query = '(hover: none), (pointer: coarse)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/** True on touch-first devices: no custom cursor, no magnetic effects, no pinned scroll. */
export function useIsTouch() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
