import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  Radio,
  Skeleton,
  Slider,
} from 'antd'
import { useState } from 'react'
import { errorMessage, toId } from '../../admin/utils'
import { useGetHeroQuery, useUpdateHeroMutation } from '../../api/adminApi'
import type { Hero } from '../../api/types'
import { lsRequired } from '../../admin/rules'
import { LocalizedInput } from '../../components/admin/LocalizedInput'
import { MediaPicker } from '../../components/admin/MediaPicker'
import { PageHeader } from '../../components/admin/PageHeader'
import { useUnsavedChanges } from '../../components/admin/useUnsavedChanges'

export const HIGHLIGHT_HINT =
  'Söz və ya ifadəni *ulduz* içinə alsanız, saytda arxasında marker xətti çəkiləcək.'

export default function HeroPage() {
  const { message } = App.useApp()
  const { data, isLoading } = useGetHeroQuery()
  const [save, { isLoading: saving }] = useUpdateHeroMutation()
  const [form] = Form.useForm<Hero>()
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)
  const bgType = Form.useWatch(['background', 'type'], form)

  if (isLoading || !data) return <Skeleton active />

  const submit = async (v: Hero) => {
    try {
      await save({
        ...v,
        eyebrow:
          v.eyebrow && Object.values(v.eyebrow).some(Boolean)
            ? v.eyebrow
            : undefined,
        background: {
          ...v.background,
          media: toId(v.background.media),
          poster: toId(v.background.poster),
        },
      }).unwrap()
      setDirty(false)
      message.success('Hero yadda saxlandı')
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Hero"
        description="Saytı açan kimi görünən ilk ekran."
        extra={
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={saving}
            disabled={!dirty}
          >
            Yadda saxla
          </Button>
        }
      />
      <Form
        form={form}
        layout="vertical"
        initialValues={data}
        onFinish={submit}
        onValuesChange={() => setDirty(true)}
        scrollToFirstError
      >
        <Card title="Mətn" style={{ marginBottom: 16 }}>
          <Form.Item
            name="eyebrow"
            label="Kiçik üst yazı (istəyə bağlı)"
            extra="Məs. “Marketinq mütəxəssisi”"
          >
            <LocalizedInput maxLength={80} />
          </Form.Item>
          <Form.Item
            name="title"
            label="Böyük başlıq"
            extra={HIGHLIGHT_HINT}
            rules={[lsRequired('Başlıq')]}
          >
            <LocalizedInput maxLength={120} />
          </Form.Item>
          <Form.Item name="subtitle" label="Alt mətn">
            <LocalizedInput rows={2} maxLength={300} />
          </Form.Item>
          <Form.Item
            name={['cta', 'label']}
            label="Düymənin mətni"
            rules={[lsRequired('Düymə mətni')]}
          >
            <LocalizedInput maxLength={40} />
          </Form.Item>
          <Form.Item
            name={['cta', 'href']}
            label="Düymə hara aparsın?"
            extra="#contact (əlaqə bölməsi), #work (işlər), /work/layihe-adi və ya https://... link"
            rules={[
              { required: true, message: 'Link məcburidir' },
              {
                pattern: /^(#[\w-]*|\/[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+)$/,
                message: 'Düzgün link deyil',
              },
            ]}
          >
            <Input style={{ maxWidth: 400 }} />
          </Form.Item>
        </Card>

        <Card title="Fon">
          <Form.Item name={['background', 'type']} label="Fon növü">
            <Radio.Group
              optionType="button"
              options={[
                { value: 'none', label: 'Yalnız tipoqrafiya' },
                { value: 'image', label: 'Şəkil' },
                { value: 'video', label: 'Video' },
              ]}
            />
          </Form.Item>
          {bgType === 'video' && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              title="Tövsiyə: MP4 (H.264), 1080p, səssiz, 10–20 saniyəlik loop. Telefonlarda video yerinə poster göstərilir."
            />
          )}
          {bgType !== 'none' && (
            <Form.Item
              name={['background', 'media']}
              label={bgType === 'video' ? 'Video' : 'Şəkil'}
              rules={[{ required: true, message: 'Fayl seçin' }]}
            >
              <MediaPicker
                key={bgType}
                kind={bgType === 'video' ? 'video' : 'image'}
              />
            </Form.Item>
          )}
          {bgType === 'video' && (
            <Form.Item
              name={['background', 'poster']}
              label="Poster şəkli"
              rules={[{ required: true, message: 'Poster seçin' }]}
            >
              <MediaPicker />
            </Form.Item>
          )}
          {bgType !== 'none' && (
            <Form.Item
              name={['background', 'overlayOpacity']}
              label="Qaralma (mətnin oxunması üçün)"
              extra="0 — şəffaf, 1 — tam qaranlıq"
            >
              <Slider min={0} max={1} step={0.05} style={{ maxWidth: 400 }} />
            </Form.Item>
          )}
        </Card>
      </Form>
    </>
  )
}
