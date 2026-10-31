import { App, Form, Modal } from 'antd'
import { useUpdateMediaMutation } from '../../api/adminApi'
import type { Media } from '../../api/types'
import { errorMessage } from '../../admin/utils'
import { lsRequired } from '../../admin/rules'
import { LocalizedInput } from './LocalizedInput'
import { MediaThumb } from './MediaThumb'

/**
 * Edits a media item's alt text (what screen readers and search engines read).
 * The Azerbaijani text is required before an image can be used.
 */
export function AltEditor({
  media,
  onClose,
  onSaved,
}: {
  media: Media | null
  onClose: () => void
  onSaved?: (m: Media) => void
}) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [update, { isLoading }] = useUpdateMediaMutation()

  const save = async () => {
    if (!media) return
    const { alt } = await form.validateFields()
    try {
      const saved = await update({ id: media._id, alt }).unwrap()
      message.success('Alt mətni yadda saxlandı')
      onSaved?.(saved)
      onClose()
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  return (
    <Modal
      open={!!media}
      title="Alt mətni"
      okText="Yadda saxla"
      cancelText="Ləğv et"
      onOk={save}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnHidden
    >
      {media && (
        <>
          <div style={{ marginBottom: 16 }}>
            <MediaThumb media={media} size={120} />
          </div>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ alt: media.alt }}
            preserve={false}
          >
            <Form.Item
              name="alt"
              label="Şəkildə nə görünür?"
              extra="Qısa təsvir yazın, məs. “Lumo Coffee kampaniyasının afişası”. Görmə məhdudiyyətli istifadəçilər və Google üçün vacibdir."
              rules={[lsRequired('Alt mətni')]}
            >
              <LocalizedInput maxLength={200} />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  )
}
