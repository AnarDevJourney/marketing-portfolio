import { CloseOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons'
import { Button, Flex, Modal, Typography } from 'antd'
import { useState } from 'react'
import type { Media } from '../../api/types'
import { MediaLibrary, type MediaKind } from './MediaLibrary'
import { MediaThumb } from './MediaThumb'
import { SortableList } from './SortableList'

const PICK_TITLE: Record<MediaKind, string> = {
  image: 'Şəkil seçin',
  video: 'Video seçin',
  file: 'Fayl seçin',
}

/** Form control for one media field: "choose from library" or "upload new" in one modal. */
export function MediaPicker({
  value,
  onChange,
  kind = 'image',
}: {
  value?: Media | null
  onChange?: (media: Media | null) => void
  kind?: MediaKind
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Flex align="center" gap={12}>
        {value ? (
          <MediaThumb media={value} size={88} />
        ) : (
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 6,
              border: '1px dashed #d9d9d9',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Boş
            </Typography.Text>
          </div>
        )}
        <Flex vertical gap={6}>
          <Button
            icon={value ? <SwapOutlined /> : <PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            {value ? 'Dəyiş' : 'Seç və ya yüklə'}
          </Button>
          {value && (
            <Button
              type="text"
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => onChange?.(null)}
            >
              Sil
            </Button>
          )}
        </Flex>
      </Flex>
      <Modal
        open={open}
        title={PICK_TITLE[kind]}
        onCancel={() => setOpen(false)}
        footer={null}
        width={960}
        destroyOnHidden
      >
        <MediaLibrary
          kind={kind}
          selectedIds={value ? [value._id] : []}
          onSelect={(m) => {
            onChange?.(m)
            setOpen(false)
          }}
        />
      </Modal>
    </>
  )
}

/** Form control for a media list (e.g. a gallery): add several, drag to reorder, remove. */
export function MediaListPicker({
  value = [],
  onChange,
  kind = 'image',
}: {
  value?: Media[]
  onChange?: (media: Media[]) => void
  kind?: MediaKind
}) {
  const [open, setOpen] = useState(false)
  const ids = value.map((m) => m._id)
  const toggle = (m: Media) =>
    onChange?.(
      ids.includes(m._id)
        ? value.filter((v) => v._id !== m._id)
        : [...value, m],
    )

  return (
    <>
      <SortableList
        items={value}
        getId={(m) => m._id}
        onChange={(items) => onChange?.(items)}
        direction="horizontal"
        renderItem={(m, handle) => (
          <div style={{ position: 'relative' }}>
            <MediaThumb media={m} size={96} />
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                background: '#fffd',
                borderRadius: 4,
              }}
            >
              {handle}
            </div>
            <Button
              size="small"
              shape="circle"
              danger
              icon={<CloseOutlined />}
              onClick={() => toggle(m)}
              style={{ position: 'absolute', top: 2, right: 2 }}
              aria-label="Sil"
            />
          </div>
        )}
      />
      <Button
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
        style={{ marginTop: value.length ? 12 : 0 }}
      >
        Əlavə et
      </Button>
      <Modal
        open={open}
        title={`${PICK_TITLE[kind]} (${value.length} seçilib)`}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
        okText="Hazırdır"
        cancelButtonProps={{ style: { display: 'none' } }}
        width={960}
        destroyOnHidden
      >
        <Typography.Paragraph type="secondary">
          Klikləyərək əlavə edin və ya çıxarın.
        </Typography.Paragraph>
        <MediaLibrary kind={kind} selectedIds={ids} onSelect={toggle} />
      </Modal>
    </>
  )
}
