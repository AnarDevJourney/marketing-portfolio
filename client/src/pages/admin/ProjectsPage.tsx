import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  App,
  Button,
  Flex,
  Popconfirm,
  Select,
  Switch,
  Tag,
  Typography,
} from 'antd'
import { Link } from 'react-router'
import type { AdminProject } from '../../admin/types'
import { errorMessage } from '../../admin/utils'
import {
  useDeleteProjectMutation,
  useListProjectsQuery,
  useReorderProjectsMutation,
  useUpdateProjectMutation,
} from '../../api/adminApi'
import { MediaThumb } from '../../components/admin/MediaThumb'
import { PageHeader } from '../../components/admin/PageHeader'
import { SectionVisibility } from '../../components/admin/SectionVisibility'
import { SortableTable } from '../../components/admin/SortableTable'
import { useWorkGroupOptions } from '../../admin/workGroups'
import { WorkGroupsCard } from '../../components/admin/WorkGroups'

export default function ProjectsPage() {
  const { message } = App.useApp()
  const { data = [], isLoading } = useListProjectsQuery()
  const [update] = useUpdateProjectMutation()
  const [remove] = useDeleteProjectMutation()
  const [reorder] = useReorderProjectsMutation()
  const groups = useWorkGroupOptions()

  const toggle = async (
    p: AdminProject,
    field: 'published' | 'featured' | 'group',
    value: boolean | string,
  ) => {
    try {
      await update({ id: p._id, body: { [field]: value } }).unwrap()
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Case study-lər"
        description="Sətirləri sürükləyərək saytdakı sıranı dəyişin. “Seçilmiş” işlər ana səhifədə göstərilir."
        sitePath="/#work"
        extra={
          <Link to="/admin/projects/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Yeni case study
            </Button>
          </Link>
        }
      />
      <SectionVisibility section="work" name="İşlər" />
      <WorkGroupsCard />
      <SortableTable<AdminProject>
        data={data}
        loading={isLoading}
        onReorder={(items) =>
          reorder(items)
            .unwrap()
            .catch((err) => message.error(errorMessage(err)))
        }
        columns={[
          {
            title: '',
            key: 'cover',
            width: 72,
            render: (_, p) => <MediaThumb media={p.cover} size={56} />,
          },
          {
            title: 'Layihə',
            key: 'title',
            render: (_, p) => (
              <Link to={`/admin/projects/${p._id}`}>
                <Typography.Text strong>{p.title.az || p.slug}</Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {p.client} · {p.year}
                </Typography.Text>
              </Link>
            ),
          },
          {
            title: 'Kateqoriya',
            key: 'category',
            render: (_, p) => <Tag>{p.category.az}</Tag>,
          },
          ...(groups.enabled
            ? [
                {
                  title: 'Qrup',
                  key: 'group',
                  width: 200,
                  render: (_: unknown, p: AdminProject) => (
                    <Select
                      size="small"
                      value={p.group ?? 'primary'}
                      options={groups.options}
                      onChange={(v) => toggle(p, 'group', v)}
                      style={{ width: '100%' }}
                      popupMatchSelectWidth={false}
                    />
                  ),
                },
              ]
            : []),
          {
            title: 'Seçilmiş',
            key: 'featured',
            render: (_, p) => (
              <Switch
                size="small"
                checked={p.featured}
                onChange={(v) => toggle(p, 'featured', v)}
              />
            ),
          },
          {
            title: 'Dərc olunub',
            key: 'published',
            render: (_, p) => (
              <Switch
                size="small"
                checked={p.published}
                onChange={(v) => toggle(p, 'published', v)}
              />
            ),
          },
          {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, p) => (
              <Flex gap={4} justify="flex-end">
                <Link to={`/admin/projects/${p._id}`}>
                  <Button size="small" icon={<EditOutlined />}>
                    Redaktə
                  </Button>
                </Link>
                <Popconfirm
                  title="Case study silinsin?"
                  okText="Sil"
                  cancelText="Ləğv et"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    remove(p._id)
                      .unwrap()
                      .then(() => message.success('Silindi'))
                      .catch((err) => message.error(errorMessage(err)))
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
    </>
  )
}
