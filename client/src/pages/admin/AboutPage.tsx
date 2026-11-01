import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import {
  App,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Skeleton,
} from 'antd'
import { useState } from 'react'
import { aboutBody } from '../../admin/about'
import { emptyLs, errorMessage } from '../../admin/utils'
import { useGetAboutQuery, useUpdateAboutMutation } from '../../api/adminApi'
import type { About } from '../../api/types'
import { lsRequired } from '../../admin/rules'
import { LocalizedInput } from '../../components/admin/LocalizedInput'
import { MediaPicker } from '../../components/admin/MediaPicker'
import { PageHeader } from '../../components/admin/PageHeader'
import { SectionVisibility } from '../../components/admin/SectionVisibility'
import { useUnsavedChanges } from '../../components/admin/useUnsavedChanges'
import { HIGHLIGHT_HINT } from './HeroPage'

export const MARKDOWN_HINT =
  'Qalın: **mətn** · Kursiv: *mətn* · Link: [mətn](https://...) · Yeni paraqraf üçün boş sətir buraxın.'

export default function AboutPage() {
  const { message } = App.useApp()
  const { data, isLoading } = useGetAboutQuery()
  const [save, { isLoading: saving }] = useUpdateAboutMutation()
  const [form] = Form.useForm<About>()
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)

  if (isLoading || !data) return <Skeleton active />

  const submit = async (v: About) => {
    try {
      // Timeline/education are edited on CareerPage; keep them as loaded.
      await save(aboutBody({ ...data, ...v })).unwrap()
      setDirty(false)
      message.success('Haqqımda bölməsi yadda saxlandı')
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Haqqımda"
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
      <SectionVisibility section="about" name="Haqqımda" />
      <Form
        form={form}
        layout="vertical"
        initialValues={data}
        onFinish={submit}
        onValuesChange={() => setDirty(true)}
        scrollToFirstError
      >
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="photo"
                label="Foto"
                extra="Şaquli (4:5) foto ən yaxşı görünür."
              >
                <MediaPicker />
              </Form.Item>
              <Form.Item name="cv" label="CV (PDF)">
                <MediaPicker kind="file" />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item
                name="heading"
                label="Başlıq"
                extra={HIGHLIGHT_HINT}
                rules={[lsRequired('Başlıq')]}
              >
                <LocalizedInput maxLength={120} />
              </Form.Item>
              <Form.Item name="bio" label="Bio" extra={MARKDOWN_HINT}>
                <LocalizedInput rows={6} maxLength={5000} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="Rəqəmlər"
          extra="Saytda 0-dan sayılaraq görünür, məs. 8+ il"
          style={{ marginBottom: 16 }}
        >
          <Form.List name="stats">
            {(fields, { add, remove }) => (
              <>
                {fields.map((f) => (
                  <MetricFields
                    key={f.key}
                    name={f.name}
                    onRemove={() => remove(f.name)}
                  />
                ))}
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => add({ value: 0, label: emptyLs() })}
                  disabled={fields.length >= 8}
                >
                  Rəqəm əlavə et
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </>
  )
}

/** value + prefix/suffix + localized label; used for About stats and project results. */
export function MetricFields({
  name,
  onRemove,
}: {
  name: number
  onRemove: () => void
}) {
  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      extra={
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={onRemove}
        />
      }
    >
      <Flex gap={12} wrap>
        <Form.Item name={[name, 'prefix']} label="Önündə" style={{ width: 90 }}>
          <Input placeholder="+" maxLength={10} />
        </Form.Item>
        <Form.Item
          name={[name, 'value']}
          label="Rəqəm"
          rules={[{ required: true, message: 'Rəqəm' }]}
          style={{ width: 140 }}
        >
          <InputNumber style={{ width: '100%' }} step={0.1} />
        </Form.Item>
        <Form.Item
          name={[name, 'suffix']}
          label="Sonunda"
          style={{ width: 90 }}
        >
          <Input placeholder="%" maxLength={10} />
        </Form.Item>
      </Flex>
      <Form.Item
        name={[name, 'label']}
        label="Açıqlama"
        rules={[lsRequired('Açıqlama')]}
        style={{ marginBottom: 0 }}
      >
        <LocalizedInput maxLength={80} />
      </Form.Item>
    </Card>
  )
}
