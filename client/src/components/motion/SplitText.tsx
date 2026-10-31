import { m, type Variants } from 'motion/react'
import { Fragment, type ElementType } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { plainText } from '../../lib/localized'
import { EASE, VIEWPORT } from '../../lib/motion'
import { Highlight } from './Highlight'

interface SplitTextProps {
  /** Text to animate. Words wrapped in *asterisks* get the marker highlight. */
  text: string
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  /** Animate on mount instead of when scrolled into view (e.g. the hero). */
  immediate?: boolean
}

/** Splits text into words that rise from behind a mask. Screen readers get the plain text via aria-label. */
export function SplitText({
  text,
  as: Tag = 'span',
  className,
  delay = 0,
  stagger = 0.06,
  immediate,
}: SplitTextProps) {
  const reduced = useReducedMotion()
  const words = tokenize(text)

  const container: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }
  const word: Variants = reduced
    ? {
        hidden: { opacity: 0 },
        shown: { opacity: 1, transition: { duration: 0.5 } },
      }
    : {
        hidden: { y: '110%' },
        shown: { y: '0%', transition: { duration: 1, ease: EASE.outExpo } },
      }
  const trigger = immediate
    ? { animate: 'shown' }
    : { whileInView: 'shown', viewport: VIEWPORT }

  return (
    <Tag className={className} aria-label={plainText(text)}>
      <m.span
        aria-hidden
        className="block"
        variants={container}
        initial="hidden"
        {...trigger}
      >
        {words.map(({ text: w, highlighted }, i) => {
          const inner = (
            <m.span className="inline-block" variants={word}>
              {w}
            </m.span>
          )
          return (
            <Fragment key={i}>
              {/* mask: padding keeps descenders (ğ, ş, ç) from being clipped */}
              <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
                {highlighted ? (
                  <Highlight delay={delay + i * stagger + 0.4}>
                    {inner}
                  </Highlight>
                ) : (
                  inner
                )}
              </span>
              {i < words.length - 1 && ' '}
            </Fragment>
          )
        })}
      </m.span>
    </Tag>
  )
}

/** "Brendləri *hekayəyə* çevirirəm" -> words, with highlighted ones flagged. */
function tokenize(text: string) {
  const out: { text: string; highlighted: boolean }[] = []
  text.split(/(\*[^*]+\*)/).forEach((part) => {
    const highlighted =
      part.startsWith('*') && part.endsWith('*') && part.length > 2
    const clean = highlighted ? part.slice(1, -1) : part
    clean
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => out.push({ text: w, highlighted }))
  })
  return out
}
