import { AnimatePresence, m } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Media } from '../../api/types'
import { useLocale } from '../../hooks/useLocale'
import { setScrollLocked } from '../../lib/lenis'
import { imageProps } from '../../lib/media'
import { EASE } from '../../lib/motion'

/** Full-screen image viewer: arrows / ← → keys to browse, Esc or click outside to close. */
export function Lightbox({
  images,
  index,
  onChange,
}: {
  images: Media[]
  index: number | null
  onChange: (index: number | null) => void
}) {
  const { t } = useTranslation()
  const { locale, defaultLocale } = useLocale()
  const closeRef = useRef<HTMLButtonElement>(null)
  const open = index !== null

  useEffect(() => {
    if (!open) return
    setScrollLocked(true)
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null)
      if (e.key === 'ArrowRight') onChange(((index ?? 0) + 1) % images.length)
      if (e.key === 'ArrowLeft')
        onChange(((index ?? 0) - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      setScrollLocked(false)
    }
  }, [open, index, images.length, onChange])

  const media = open ? images[index] : null

  return (
    <AnimatePresence>
      {media && (
        <m.div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/95 p-4 backdrop-blur md:p-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onChange(null)}
        >
          <m.img
            key={media._id}
            {...imageProps(media, locale, defaultLocale, '100vw')}
            src={media.variants?.w1920 ?? media.url}
            className="max-h-full max-w-full rounded-sm object-contain"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE.outQuart }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            ref={closeRef}
            onClick={() => onChange(null)}
            className="absolute top-6 right-6 text-label text-fg/70 hover:text-fg"
          >
            {t('project.close')} ✕
          </button>
          {images.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-6 text-label"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() =>
                  onChange((index! - 1 + images.length) % images.length)
                }
                aria-label={t('project.prev')}
                className="hover:text-primary"
              >
                ←
              </button>
              <span className="text-fg/60 tabular-nums">
                {index! + 1} / {images.length}
              </span>
              <button
                onClick={() => onChange((index! + 1) % images.length)}
                aria-label={t('project.nextImage')}
                className="hover:text-primary"
              >
                →
              </button>
            </div>
          )}
        </m.div>
      )}
    </AnimatePresence>
  )
}
