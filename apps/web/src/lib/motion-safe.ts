import { useReducedMotion } from 'framer-motion'

/** Evita contingut invisible quan l'animació no s'executa (p.ex. reduir moviment). */
export function useMotionSafe() {
  const reduce = useReducedMotion()
  return {
    reduce: !!reduce,
    hidden: reduce ? false : ({ opacity: 0, y: 16 } as const),
    visible: { opacity: 1, y: 0 } as const,
    hiddenScale: reduce ? false : ({ opacity: 0, scale: 0.96 } as const),
    visibleScale: { opacity: 1, scale: 1 } as const,
  }
}
