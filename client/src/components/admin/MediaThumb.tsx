import { FilePdfOutlined, PlayCircleOutlined } from '@ant-design/icons'
import type { Media } from '../../api/types'

/** Square-ish preview of any media item. */
export function MediaThumb({
  media,
  size = 96,
}: {
  media: Media
  size?: number | string
}) {
  // A string size (e.g. "100%") fills the container width as a square.
  const box = {
    width: size,
    height: typeof size === 'number' ? size : undefined,
    aspectRatio: '1',
    borderRadius: 6,
    overflow: 'hidden',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    flexShrink: 0,
  }
  if (media.type === 'image') {
    return (
      <div style={box}>
        <img
          src={media.variants?.w480 ?? media.url}
          alt={media.alt?.az ?? ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }
  if (media.type === 'video') {
    return (
      <div style={box}>
        <video
          src={media.url}
          muted
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <PlayCircleOutlined
          style={{
            position: 'absolute',
            fontSize: 28,
            color: '#fff',
            textShadow: '0 1px 4px #0008',
          }}
        />
      </div>
    )
  }
  return (
    <div style={box}>
      <FilePdfOutlined style={{ fontSize: 32, color: '#cf1322' }} />
    </div>
  )
}
