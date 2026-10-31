import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  App,
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  Popconfirm,
  Select,
  Switch,
  Typography,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { type ReactNode, useState } from 'react'
import type {
  AdminClient,
  AdminService,
  AdminTestimonial,
  Orderable,
} from '../../admin/types'
import { emptyLs, errorMessage, toId } from '../../admin/utils'
import {
  useCreateClientMutation,
  useCreateServiceMutation,
  useCreateTestimonialMutation,
  useDeleteClientMutation,
  useDeleteServiceMutation,
  useDeleteTestimonialMutation,
  useListClientsQuery,
  useListServicesQuery,
  useListTestimonialsQuery,
  useReorderClientsMutation,
  useReorderServicesMutation,
  useReorderTestimonialsMutation,
  useUpdateClientMutation,
  useUpdateServiceMutation,
  useUpdateTestimonialMutation,
} from '../../api/adminApi'
import { ServiceIcon, SERVICE_ICONS } from '../../lib/icons'
import { lsRequired } from '../../admin/rules'
import { LocalizedInput } from '../../components/admin/LocalizedInput'
import { MediaPicker } from '../../components/admin/MediaPicker'
import { MediaThumb } from '../../components/admin/MediaThumb'
import { PageHeader } from '../../components/admin/PageHeader'
import { SortableTable } from '../../components/admin/SortableTable'

type Body = Record<string, unknown>
type MutationTrigger<A, R> = (arg: A) => { unwrap: () => Promise<R> }

interface CollectionConfig<T extends Orderable> {
  title: string
  description: string
  sitePath: string
  itemName: string
  list: { data?: T[]; isLoading: boolean }
  create: MutationTrigger<Body, T>
  update: MutationTrigger<{ id: string; body: Body }, T>
  remove: MutationTrigger<string, void>
  reorder: MutationTrigger<{ id: string; order: number }[], T[]>
  columns: TableColumnsType<T>
  fields: ReactNode
  defaults: Partial<T>
  /** Form values -> API body (e.g. media objects -> ids). */
  toBody?: (values: T) => Body
}

/** Shared page for small sortable collections: table with drag-sort + published switch, drawer form. */
function CollectionPage<T extends Orderable>(cfg: CollectionConfig<T>) {
  const { message } = App.useApp()
  const [form] = Form.useForm<T>()
  const [editing, setEditing] = useState<T | 'new' | null>(null)
  const [saving, setSaving] = useState(false)
  const toBody = cfg.toBody ?? ((v: T) => v as unknown as Body)

  const run = async (action: () => Promise<unknown>, ok?: string) => {
    try {
      await action()
      if (ok) message.success(ok)
      return true
    } catch (err) {
      message.error(errorMessage(err))
      return false
    }
  }

  const submit = async (values: T) => {
    setSaving(true)
    const body = toBody(values)
    const ok = await run(
      () =>
        editing === 'new'
          ? cfg.create(body).unwrap()
          : cfg.update({ id: (editing as T)._id, body }).unwrap(),
      'Yadda saxlandı',
    )
    setSaving(false)
    if (ok) setEditing(null)
  }

  return (
    <>
      <PageHeader
        title={cfg.title}
        description={cfg.description}
        sitePath={cfg.sitePath}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEditing('new')}
          >
            Əlavə et
          </Button>
        }
      />
      <SortableTable<T>
        data={cfg.list.data ?? []}
        loading={cfg.list.isLoading}
        onReorder={(items) => run(() => cfg.reorder(items).unwrap())}
        columns={[
          ...cfg.columns,
          {
            title: 'Dərc olunub',
            key: 'published',
            width: 120,
            render: (_, item) => (
              <Switch
                size="small"
                checked={item.published}
                onChange={(published) =>
                  run(() =>
                    cfg.update({ id: item._id, body: { published } }).unwrap(),
                  )
                }
              />
            ),
          },
          {
            title: '',
            key: 'actions',
            align: 'right',
            width: 150,
            render: (_, item) => (
              <Flex gap={4} justify="flex-end">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setEditing(item)}
                >
                  Redaktə
                </Button>
                <Popconfirm
                  title={`${cfg.itemName} silinsin?`}
                  okText="Sil"
                  cancelText="Ləğv et"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    run(() => cfg.remove(item._id).unwrap(), 'Silindi')
                  }
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label="Sil"
                  />
                </Popconfirm>
              </Flex>
            ),
          },
        ]}
      />
      <Drawer
        open={editing !== null}
        title={
          editing === 'new'
            ? `Yeni: ${cfg.itemName}`
            : `Redaktə: ${cfg.itemName}`
        }
        size={560}
        onClose={() => setEditing(null)}
        destroyOnHidden
        extra={
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            Yadda saxla
          </Button>
        }
      >
        {editing !== null && (
          <Form
            form={form}
            layout="vertical"
            preserve={false}
            initialValues={
              editing === 'new' ? { published: true, ...cfg.defaults } : editing
            }
            onFinish={submit}
          >
            {cfg.fields}
            <Form.Item
              name="published"
              label="Saytda göstər"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </>
  )
}

const urlRule = { type: 'url' as const, message: 'https:// ilə başlayan link' }

export function ClientsPage() {
  const [create] = useCreateClientMutation()
  const [update] = useUpdateClientMutation()
  const [remove] = useDeleteClientMutation()
  const [reorder] = useReorderClientsMutation()
  return (
    <CollectionPage<AdminClient>
      title="Müştərilər"
      description="Loqolar ana səhifədə sonsuz sırada axır. Şəffaf fonlu, açıq rəngli loqolar ən yaxşı görünür."
      sitePath="/#clients"
      itemName="Müştəri"
      list={useListClientsQuery()}
      create={create}
      update={update}
      remove={remove}
      reorder={reorder}
      defaults={{ name: '' }}
      toBody={(v) => ({
        ...v,
        logo: toId(v.logo),
        website: v.website || undefined,
      })}
      columns={[
        {
          title: '',
          key: 'logo',
          width: 80,
          render: (_, c) => <MediaThumb media={c.logo} size={56} />,
        },
        { title: 'Ad', dataIndex: 'name', key: 'name' },
        {
          title: 'Sayt',
          key: 'website',
          render: (_, c) =>
            c.website ? (
              <Typography.Link href={c.website} target="_blank">
                {c.website}
              </Typography.Link>
            ) : (
              '—'
            ),
        },
      ]}
      fields={
        <>
          <Form.Item
            name="name"
            label="Ad"
            rules={[{ required: true, message: 'Ad məcburidir' }]}
          >
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item
            name="logo"
            label="Loqo"
            rules={[{ required: true, message: 'Loqo seçin' }]}
          >
            <MediaPicker />
          </Form.Item>
          <Form.Item
            name="website"
            label="Sayt (istəyə bağlı)"
            rules={[urlRule]}
          >
            <Input placeholder="https://..." />
          </Form.Item>
        </>
      }
    />
  )
}

export function TestimonialsPage() {
  const [create] = useCreateTestimonialMutation()
  const [update] = useUpdateTestimonialMutation()
  const [remove] = useDeleteTestimonialMutation()
  const [reorder] = useReorderTestimonialsMutation()
  return (
    <CollectionPage<AdminTestimonial>
      title="Rəylər"
      description="Müştəri sitatları ana səhifədə slider kimi göstərilir."
      sitePath="/#testimonials"
      itemName="Rəy"
      list={useListTestimonialsQuery()}
      create={create}
      update={update}
      remove={remove}
      reorder={reorder}
      defaults={{ author: '', role: emptyLs(), quote: emptyLs() }}
      toBody={(v) => ({
        ...v,
        avatar: toId(v.avatar),
        company: v.company || undefined,
      })}
      columns={[
        {
          title: '',
          key: 'avatar',
          width: 72,
          render: (_, t) =>
            t.avatar ? <MediaThumb media={t.avatar} size={48} /> : null,
        },
        {
          title: 'Müəllif',
          key: 'author',
          render: (_, t) => (
            <>
              <Typography.Text strong>{t.author}</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t.role.az}
                {t.company && ` — ${t.company}`}
              </Typography.Text>
            </>
          ),
        },
        {
          title: 'Sitat',
          key: 'quote',
          render: (_, t) => (
            <Typography.Paragraph
              ellipsis={{ rows: 2 }}
              style={{ margin: 0, maxWidth: 420 }}
            >
              {t.quote.az}
            </Typography.Paragraph>
          ),
        },
      ]}
      fields={
        <>
          <Form.Item
            name="author"
            label="Ad, soyad"
            rules={[{ required: true, message: 'Ad məcburidir' }]}
          >
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item name="role" label="Vəzifə" rules={[lsRequired('Vəzifə')]}>
            <LocalizedInput maxLength={120} />
          </Form.Item>
          <Form.Item name="company" label="Şirkət (istəyə bağlı)">
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item name="quote" label="Sitat" rules={[lsRequired('Sitat')]}>
            <LocalizedInput rows={4} maxLength={1000} />
          </Form.Item>
          <Form.Item name="avatar" label="Foto (istəyə bağlı)">
            <MediaPicker />
          </Form.Item>
        </>
      }
    />
  )
}

const ICON_OPTIONS = Object.keys(SERVICE_ICONS).map((name) => ({
  value: name,
  label: (
    <Flex align="center" gap={8}>
      <ServiceIcon name={name} size={16} /> {name}
    </Flex>
  ),
}))

export function ServicesPage() {
  const [create] = useCreateServiceMutation()
  const [update] = useUpdateServiceMutation()
  const [remove] = useDeleteServiceMutation()
  const [reorder] = useReorderServicesMutation()
  return (
    <CollectionPage<AdminService>
      title="Xidmətlər"
      description="Ana səhifədəki xidmət kartları."
      sitePath="/#services"
      itemName="Xidmət"
      list={useListServicesQuery()}
      create={create}
      update={update}
      remove={remove}
      reorder={reorder}
      defaults={{ title: emptyLs(), description: emptyLs(), icon: 'sparkles' }}
      columns={[
        {
          title: '',
          key: 'icon',
          width: 56,
          render: (_, s) => (
            <ServiceIcon name={s.icon} size={22} color="#ff5b2e" />
          ),
        },
        {
          title: 'Xidmət',
          key: 'title',
          render: (_, s) => (
            <Typography.Text strong>{s.title.az}</Typography.Text>
          ),
        },
        {
          title: 'Təsvir',
          key: 'description',
          render: (_, s) => (
            <Typography.Paragraph
              ellipsis={{ rows: 2 }}
              style={{ margin: 0, maxWidth: 480 }}
            >
              {s.description.az}
            </Typography.Paragraph>
          ),
        },
      ]}
      fields={
        <>
          <Form.Item name="title" label="Ad" rules={[lsRequired('Ad')]}>
            <LocalizedInput maxLength={80} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Təsvir"
            rules={[lsRequired('Təsvir')]}
          >
            <LocalizedInput rows={3} maxLength={500} />
          </Form.Item>
          <Form.Item
            name="icon"
            label="İkon"
            rules={[{ required: true, message: 'İkon seçin' }]}
          >
            <Select options={ICON_OPTIONS} showSearch />
          </Form.Item>
        </>
      }
    />
  )
}
