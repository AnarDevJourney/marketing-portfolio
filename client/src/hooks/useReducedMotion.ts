import { useReducedMotion as useMotionReducedMotion } from 'motion/react'

/** True when the user asked the OS to reduce motion. Heavy effects must turn off. */
export function useReducedMotion() {
  return useMotionReducedMotion() ?? false
}
