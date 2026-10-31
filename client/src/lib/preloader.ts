const SEEN_KEY = 'preloader-seen'

/** The intro plays once per browser session. */
export function hasSeenPreloader() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function markPreloaderSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // storage unavailable — the intro may play again, which is harmless
  }
}
