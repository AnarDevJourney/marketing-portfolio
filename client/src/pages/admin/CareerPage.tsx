import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { App, Button, Card, Col, Flex, Form, Input, Row, Skeleton } from 'antd'
import { useState } from 'react'
import { aboutBody } from '../../admin/about'
import { lsRequired } from '../../admin/rules'
import { emptyLs, errorMessage } from '../../admin/utils'
import { useGetAboutQuery, useUpdateAboutMutation } from '../../api/adminApi'
import type { About } from '../../api/types'
import { LocalizedInput } from '../../components/admin/LocalizedInput'
import { PageHeader } from '../../components/admin/PageHeader'
import { VisibilityBanner } from '../../components/admin/SectionVisibility'
import { useUnsavedChanges } from '../../components/admin/useUnsavedChanges'

type CareerValues = Pick<About, 'timeline' | 'education'>

/** Experience + education timelines (stored on the about document, shown in the About section). */
export default function CareerPage() {
  const { message } = App.useApp()
  const { data, isLoading } = useGetAboutQuery()
  const [save, { isLoading: saving }] = useUpdateAboutMutation()
  const [form] = Form.useForm<CareerValues>()
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)

  if (isLoading || !data) return <Skeleton active />

  const submit = async (v: CareerValues) => {
    try {
      // Other about fields are edited on AboutPage; keep them as loaded.
      await save(aboutBody({ ...data, ...v })).unwrap()
      setDirty(false)
      message.success('Təcrübə və təhsil yadda saxlandı')
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Təcrübə və təhsil"
        description="Saytda Haqqımda bölməsinin altında görünür: solda təcrübə, sağda təhsil."
        sitePath="/#about"
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
      <VisibilityBanner
        name="Təcrübə və təhsil"
        visible={data.careerVisible ?? true}
        loading={saving}
        hiddenFrom="saytda"
        note="Haqqımda bölməsinin qalan hissəsi (foto, bio, rəqəmlər) yerində qalır."
        // Saves only the flag, from the loaded data — unsaved form edits stay in the form.
        onChange={(careerVisible) =>
          save(aboutBody({ ...data, careerVisible })).unwrap()
        }
      />
      <Form
        form={form}
        layout="vertical"
        initialValues={{ timeline: data.timeline, education: data.education }}
        onFinish={submit}
        onValuesChange={() => setDirty(true)}
        scrollToFirstError
      >
        <TimelineCard
          name="timeline"
          title="Təcrübə"
          labels={{
            company: 'Şirkət',
            title: 'Vəzifə',
            add: 'Təcrübə əlavə et',
          }}
        />
        <TimelineCard
          name="education"
          title="Təhsil"
          labels={{
            company: 'Təhsil müəssisəsi',
            title: 'İxtisas / dərəcə',
            add: 'Təhsil əlavə et',
          }}
        />
      </Form>
    </>
  )
}

/** Repeatable period / title / organisation / description list (experience, education). */
function TimelineCard({
  name,
  title,
  extra,
  labels,
}: {
  name: 'timeline' | 'education'
  title: string
  extra?: string
  labels: { company: string; title: string; add: string }
}) {
  return (
    <Card title={title} extra={extra} style={{ marginBottom: 16 }}>
      <Form.List name={name}>
        {(fields, { add, remove, move }) => (
          <>
            {fields.map((f, i) => (
              <Card
                key={f.key}
                size="small"
                style={{ marginBottom: 12 }}
                extra={
                  <Flex gap={4}>
                    <Button
                      size="small"
                      disabled={i === 0}
                      onClick={() => move(i, i - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      size="small"
                      disabled={i === fields.length - 1}
                      onClick={() => move(i, i + 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(f.name)}
                    />
                  </Flex>
                }
              >
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={[f.name, 'period']}
                      label="Dövr"
                      rules={[{ required: true, message: 'Məs. 2020 — 2023' }]}
                    >
                      <Input placeholder="2020 — 2023" maxLength={40} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={16}>
                    <Form.Item
                      name={[f.name, 'company']}
                      label={labels.company}
                      rules={[{ required: true, message: labels.company }]}
                    >
                      <Input maxLength={120} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name={[f.name, 'title']}
                  label={labels.title}
                  rules={[lsRequired(labels.title)]}
                >
                  <LocalizedInput maxLength={120} />
                </Form.Item>
                <Form.Item
                  name={[f.name, 'description']}
                  label="Qısa təsvir (istəyə bağlı)"
                >
                  <LocalizedInput rows={2} maxLength={500} />
                </Form.Item>
              </Card>
            ))}
            <Button
              icon={<PlusOutlined />}
              onClick={() => add({ period: '', company: '', title: emptyLs() })}
              disabled={fields.length >= 30}
            >
              {labels.add}
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  )
}
