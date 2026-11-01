import { useState } from 'react'
import type { Media } from '../../api/types'
import { useLocale } from '../../hooks/useLocale'
import { imageProps } from '../../lib/media'

interface ImgProps {
  media: Media
  sizes?: string
  className?: string
  imgClassName?: string
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean
}

/**
 * Responsive WebP image with the blur placeholder behind it and a fade-in
 * on load. Width/height come from the media document, so there is no layout shift.
 */
export function Img({
  media,
  sizes = '100vw',
  className = '',
  imgClassName = '',
  priority,
}: ImgProps) {
  const { locale, defaultLocale } = useLocale()
  const [loaded, setLoaded] = useState(false)
  return (
    <div
      className={`overflow-hidden bg-surface bg-cover bg-center ${className}`}
      style={
        media.blurDataUrl
          ? { backgroundImage: `url(${media.blurDataUrl})` }
          : undefined
      }
    >
      <img
        {...imageProps(media, locale, defaultLocale, sizes)}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        // Priority (LCP) images paint as soon as they arrive: an opacity-0 start would
        // keep them out of LCP until React handles onLoad and the fade runs.
        className={`h-full w-full object-cover ${priority || loaded ? 'opacity-100' : 'opacity-0 transition-opacity duration-700'} ${imgClassName}`}
      />
    </div>
  )
}
