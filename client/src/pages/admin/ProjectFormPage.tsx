import { PlusOutlined } from '@ant-design/icons'
import {
  App,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton,
  Switch,
} from 'antd'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { AdminProject } from '../../admin/types'
import { emptyLs, errorMessage, slugify, toId } from '../../admin/utils'
import {
  useCreateProjectMutation,
  useGetProjectQuery,
  useUpdateProjectMutation,
} from '../../api/adminApi'
import { lsRequired } from '../../admin/rules'
import { LocalizedInput } from '../../components/admin/LocalizedInput'
import {
  MediaListPicker,
  MediaPicker,
} from '../../components/admin/MediaPicker'
import { PageHeader } from '../../components/admin/PageHeader'
import { useUnsavedChanges } from '../../components/admin/useUnsavedChanges'
import { MARKDOWN_HINT, MetricFields } from './AboutPage'

const EMPTY: Partial<AdminProject> = {
  slug: '',
  title: emptyLs(),
  client: '',
  category: emptyLs(),
  year: new Date().getFullYear(),
  summary: emptyLs(),
  challenge: emptyLs(),
  solution: emptyLs(),
  results: [],
  gallery: [],
  tags: [],
  featured: false,
  published: false,
}

export default function ProjectFormPage() {
  const { id } = useParams()
  const { data, isLoading } = useGetProjectQuery(id ?? '', { skip: !id })
  if (id && (isLoading || !data)) return <Skeleton active />
  return <ProjectForm key={id ?? 'new'} project={id ? data : undefined} />
}

function ProjectForm({ project }: { project?: AdminProject }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [form] = Form.useForm<AdminProject>()
  const [dirty, setDirty] = useState(false)
  // Auto-fill the slug from the title until the user edits it by hand (new projects only).
  const [slugTouched, setSlugTouched] = useState(!!project)
  const [create, { isLoading: creating }] = useCreateProjectMutation()
  const [update, { isLoading: updating }] = useUpdateProjectMutation()
  useUnsavedChanges(dirty)
  const slug = Form.useWatch('slug', form)

  const submit = async (v: AdminProject) => {
    const body = {
      ...v,
      cover: toId(v.cover),
      coverVideo: toId(v.coverVideo),
      gallery: (v.gallery ?? []).map((m) => m._id),
      results: v.results ?? [],
      tags: v.tags ?? [],
    }
    try {
      if (project) {
        await update({ id: project._id, body }).unwrap()
        message.success('Yadda saxlandı')
        setDirty(false)
      } else {
        const created = await create(body).unwrap()
        setDirty(false)
        message.success('Case study yaradıldı')
        // let the unsaved-changes guard see the clean state before navigating
        setTimeout(
          () =>
            void navigate(`/admin/projects/${created._id}`, { replace: true }),
        )
      }
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title={project ? project.title.az || project.slug : 'Yeni case study'}
        sitePath={project ? `/work/${slug || project.slug}` : false}
        extra={
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={creating || updating}
            disabled={!dirty}
          >
            {project ? 'Yadda saxla' : 'Yarat'}
          </Button>
        }
      />
      <Form
        form={form}
        layout="vertical"
        initialValues={project ?? EMPTY}
        onFinish={submit}
        onFinishFailed={() =>
          message.error('Bəzi sahələr düzgün doldurulmayıb')
        }
        onValuesChange={(changed: Partial<AdminProject>) => {
          setDirty(true)
          if (changed.slug !== undefined) setSlugTouched(true)
          if (changed.title && !slugTouched) {
            const t = form.getFieldValue('title')
            form.setFieldValue('slug', slugify(t.en || t.az))
          }
        }}
        scrollToFirstError
      >
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <Card title="Əsas məlumat" style={{ marginBottom: 16 }}>
              <Form.Item
                name="title"
                label="Başlıq"
                rules={[lsRequired('Başlıq')]}
              >
                <LocalizedInput maxLength={120} />
              </Form.Item>
              <Form.Item
                name="slug"
                label="Ünvan (slug)"
                extra={`Saytda: /work/${slug || '...'} — kiçik latın hərfləri, rəqəmlər və “-”`}
                rules={[
                  { required: true, message: 'Slug məcburidir' },
                  {
                    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: 'Yalnız kiçik latın hərfləri, rəqəm və tire',
                  },
                ]}
              >
                <Input addonBefore="/work/" maxLength={120} />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="client"
                    label="Müştəri"
                    rules={[{ required: true, message: 'Müştəri adı' }]}
                  >
                    <Input maxLength={120} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="year"
                    label="İl"
                    rules={[{ required: true, message: 'İl' }]}
                  >
                    <InputNumber
                      min={1990}
                      max={2100}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="category"
                label="Kateqoriya"
                extra="Məs. SMM, Brend, Performance"
                rules={[lsRequired('Kateqoriya')]}
              >
                <LocalizedInput maxLength={60} />
              </Form.Item>
              <Form.Item
                name="summary"
                label="Qısa təsvir (kartda görünür)"
                rules={[lsRequired('Qısa təsvir')]}
              >
                <LocalizedInput rows={2} maxLength={300} />
              </Form.Item>
            </Card>

            <Card title="Hekayə" style={{ marginBottom: 16 }}>
              <Form.Item
                name="challenge"
                label="Problem"
                extra={MARKDOWN_HINT}
                rules={[lsRequired('Problem')]}
              >
                <LocalizedInput rows={5} maxLength={5000} />
              </Form.Item>
              <Form.Item
                name="solution"
                label="Həll"
                extra={MARKDOWN_HINT}
                rules={[lsRequired('Həll')]}
              >
                <LocalizedInput rows={5} maxLength={5000} />
              </Form.Item>
            </Card>

            <Card
              title="Nəticələr"
              extra="Ən vacib hissə — böyük rəqəmlərlə göstərilir"
              style={{ marginBottom: 16 }}
            >
              <Form.List name="results">
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
                      disabled={fields.length >= 12}
                    >
                      Nəticə əlavə et
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            <Card title="Qalereya" style={{ marginBottom: 16 }}>
              <Form.Item
                name="gallery"
                extra="Sürükləyərək sıralayın"
                style={{ marginBottom: 0 }}
              >
                <MediaListPicker />
              </Form.Item>
            </Card>

            <Collapse
              items={[
                {
                  key: 'seo',
                  label: 'SEO (istəyə bağlı)',
                  forceRender: true,
                  children: (
                    <>
                      <Form.Item
                        name={['seo', 'title']}
                        label="SEO başlığı"
                        extra="Boş qalsa layihənin başlığı istifadə olunur."
                      >
                        <LocalizedInput maxLength={120} />
                      </Form.Item>
                      <Form.Item
                        name={['seo', 'description']}
                        label="SEO təsviri"
                        extra="Boş qalsa qısa təsvir istifadə olunur."
                      >
                        <LocalizedInput rows={2} maxLength={300} />
                      </Form.Item>
                    </>
                  ),
                },
              ]}
            />
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Dərc" style={{ marginBottom: 16 }}>
              <Form.Item
                name="published"
                label="Saytda göstər"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="featured"
                label="Ana səhifədə seçilmiş"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch />
              </Form.Item>
            </Card>
            <Card title="Şəkillər" style={{ marginBottom: 16 }}>
              <Form.Item
                name="cover"
                label="Örtük şəkli"
                rules={[{ required: true, message: 'Örtük şəkli seçin' }]}
              >
                <MediaPicker />
              </Form.Item>
              <Form.Item
                name="coverVideo"
                label="Hover videosu (istəyə bağlı)"
                extra="Kartın üzərinə gələndə oynayan qısa loop."
                style={{ marginBottom: 0 }}
              >
                <MediaPicker kind="video" />
              </Form.Item>
            </Card>
            <Card title="Teqlər">
              <Form.Item name="tags" style={{ marginBottom: 0 }}>
                <Select
                  mode="tags"
                  placeholder="Yazıb Enter basın"
                  maxCount={20}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  )
}
