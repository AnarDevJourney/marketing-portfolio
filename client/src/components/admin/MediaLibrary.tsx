import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  LinkOutlined,
  WarningFilled,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Flex,
  Pagination,
  Popover,
  Segmented,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd'
import { useState } from 'react'
import {
  useDeleteMediaMutation,
  useLazyMediaUsageQuery,
  useListMediaQuery,
  useMediaUsageQuery,
  useUploadMediaMutation,
} from '../../api/adminApi'
import type { Media } from '../../api/types'
import type { MediaItem, MediaUsage } from '../../admin/types'
import { errorMessage, formatBytes } from '../../admin/utils'
import { AltEditor } from './AltEditor'
import { MediaThumb } from './MediaThumb'

export type MediaKind = 'image' | 'video' | 'file'

const ACCEPT: Record<MediaKind, string> = {
  image: '.jpg,.jpeg,.png,.webp,.avif',
  video: '.mp4,.webm',
  file: '.pdf',
}
const KIND_LABEL: Record<MediaKind, string> = {
  image: 'Şəkillər',
  video: 'Videolar',
  file: 'Fayllar',
}
const COLLECTION_LABEL: Record<string, string> = {
  settings: 'Parametrlər',
  hero: 'Hero',
  about: 'Haqqımda',
  projects: 'Case study',
  clients: 'Müştərilər',
  testimonials: 'Rəylər',
}

interface MediaLibraryProps {
  /** Restrict to one kind (picker mode). */
  kind?: MediaKind
  /** Picker mode: called when an item is chosen. Management mode when omitted. */
  onSelect?: (media: Media) => void
  /** Ids highlighted as selected (picker, multiple). */
  selectedIds?: string[]
}

/** Grid of uploaded media with drag-and-drop upload; used by the library page and the MediaPicker modal. */
export function MediaLibrary({
  kind,
  onSelect,
  selectedIds = [],
}: MediaLibraryProps) {
  const { message, modal } = App.useApp()
  const [filter, setFilter] = useState<MediaKind | 'all'>(kind ?? 'all')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Media | null>(null)
  const [pendingSelect, setPendingSelect] = useState<Media | null>(null)
  const type = kind ?? (filter === 'all' ? undefined : filter)
  const { data, isFetching } = useListMediaQuery({ type, page, limit: 24 })
  const [upload] = useUploadMediaMutation()
  const [remove] = useDeleteMediaMutation()
  const [getUsage] = useLazyMediaUsageQuery()

  // Images need alt text before they can be used.
  const choose = (m: Media) => {
    if (!onSelect) return
    if (m.type === 'image' && !m.alt?.az?.trim()) {
      setPendingSelect(m)
      setEditing(m)
      return
    }
    onSelect(m)
  }

  const confirmDelete = async (m: MediaItem) => {
    const usage = await getUsage(m._id)
      .unwrap()
      .catch(() => [] as MediaUsage[])
    if (usage.length) {
      modal.warning({
        title: 'Bu fayl istifadə olunur',
        content: <UsageList usage={usage} />,
        okText: 'Aydındır',
      })
      return
    }
    modal.confirm({
      title: 'Faylı silmək?',
      content: 'Bu əməliyyatı geri qaytarmaq olmur.',
      okText: 'Sil',
      okButtonProps: { danger: true },
      cancelText: 'Ləğv et',
      onOk: async () => {
        try {
          await remove(m._id).unwrap()
          message.success('Fayl silindi')
        } catch (err) {
          message.error(errorMessage(err))
        }
      },
    })
  }

  return (
    <div>
      <Upload.Dragger
        multiple
        accept={kind ? ACCEPT[kind] : Object.values(ACCEPT).join(',')}
        showUploadList={false}
        customRequest={async ({ file, onSuccess, onError }) => {
          try {
            const [saved] = await upload([file as File]).unwrap()
            message.success(`${(file as File).name} yükləndi`)
            onSuccess?.(saved)
            if (saved.type === 'image') setEditing(saved)
          } catch (err) {
            message.error(errorMessage(err, 'Yükləmək alınmadı'))
            onError?.(err as Error)
          }
        }}
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Faylları bura sürükləyin və ya klikləyin
        </p>
        <p className="ant-upload-hint">
          Şəkil: JPG, PNG, WebP, AVIF (≤ 15 MB) · Video: MP4, WebM (≤ 60 MB) ·
          PDF (≤ 10 MB). SVG qəbul olunmur.
        </p>
      </Upload.Dragger>

      {(kind === 'video' || filter === 'video') && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          title="Video tövsiyəsi: MP4 (H.264), 1080p, səssiz, 10–20 saniyəlik loop. Poster şəklini ayrıca yükləyin."
        />
      )}

      {!kind && (
        <Segmented
          style={{ marginBottom: 16 }}
          value={filter}
          onChange={(v) => {
            setFilter(v as MediaKind | 'all')
            setPage(1)
          }}
          options={[
            { label: 'Hamısı', value: 'all' },
            ...(Object.keys(KIND_LABEL) as MediaKind[]).map((k) => ({
              label: KIND_LABEL[k],
              value: k,
            })),
          ]}
        />
      )}

      <Spin spinning={isFetching}>
        {data && data.items.length === 0 ? (
          <Empty description="Hələ fayl yoxdur" />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 12,
            }}
          >
            {data?.items.map((m) => {
              const selected = selectedIds.includes(m._id)
              const noAlt = m.type === 'image' && !m.alt?.az?.trim()
              return (
                <Card
                  key={m._id}
                  size="small"
                  hoverable={!!onSelect}
                  onClick={() => choose(m)}
                  styles={{ body: { padding: 8 } }}
                  style={
                    selected ? { outline: '2px solid #ff5b2e' } : undefined
                  }
                  cover={<MediaThumb media={m} size="100%" />}
                >
                  <Flex justify="space-between" align="center" gap={4}>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 12 }}
                      ellipsis
                    >
                      {formatBytes(m.size)}
                      {m.width ? ` · ${m.width}×${m.height}` : ''}
                    </Typography.Text>
                    {noAlt && (
                      <Tooltip title="Alt mətni yoxdur">
                        <WarningFilled style={{ color: '#faad14' }} />
                      </Tooltip>
                    )}
                  </Flex>
                  {!onSelect && (
                    <Flex
                      gap={4}
                      style={{ marginTop: 6 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="Alt mətni">
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setEditing(m)}
                        />
                      </Tooltip>
                      <Popover
                        trigger="click"
                        title="Harada istifadə olunur"
                        content={<UsagePopover id={m._id} />}
                      >
                        <Tooltip title="Harada istifadə olunur">
                          <Button size="small" icon={<LinkOutlined />} />
                        </Tooltip>
                      </Popover>
                      <Tooltip title="Sil">
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => void confirmDelete(m)}
                        />
                      </Tooltip>
                    </Flex>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </Spin>

      {data && data.total > data.limit && (
        <Pagination
          style={{ marginTop: 16, textAlign: 'center' }}
          current={page}
          pageSize={data.limit}
          total={data.total}
          onChange={setPage}
          showSizeChanger={false}
        />
      )}

      <AltEditor
        media={editing}
        onClose={() => {
          setEditing(null)
          setPendingSelect(null)
        }}
        onSaved={(saved) => {
          if (pendingSelect && saved._id === pendingSelect._id)
            onSelect?.(saved)
        }}
      />
    </div>
  )
}

/** Rendered only when the popover opens, so the usage request is made on demand. */
function UsagePopover({ id }: { id: string }) {
  const { data, isFetching } = useMediaUsageQuery(id, {
    refetchOnMountOrArgChange: true,
  })
  if (isFetching || !data) return <Spin size="small" />
  return <UsageList usage={data} />
}

function UsageList({ usage }: { usage: MediaUsage[] }) {
  if (!usage.length)
    return (
      <Typography.Text type="secondary">
        Heç yerdə istifadə olunmur
      </Typography.Text>
    )
  return (
    <Flex vertical gap={4}>
      {usage.map((u, i) => (
        <span key={i}>
          <Tag>{COLLECTION_LABEL[u.collection] ?? u.collection}</Tag>
          <Typography.Text type="secondary">{u.field}</Typography.Text>
        </span>
      ))}
    </Flex>
  )
}
