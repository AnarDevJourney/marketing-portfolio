import { DeleteOutlined, MailOutlined } from '@ant-design/icons'
import {
  App,
  Badge,
  Button,
  Flex,
  Popconfirm,
  Segmented,
  Table,
  Tooltip,
  Typography,
} from 'antd'
import { useState } from 'react'
import type { ContactMessage } from '../../admin/types'
import { errorMessage } from '../../admin/utils'
import {
  useDeleteMessageMutation,
  useListMessagesQuery,
  useUpdateMessageMutation,
} from '../../api/adminApi'
import { PageHeader } from '../../components/admin/PageHeader'
import { SectionVisibility } from '../../components/admin/SectionVisibility'

export default function MessagesPage() {
  const { message } = App.useApp()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [page, setPage] = useState(1)
  const read = filter === 'all' ? undefined : filter === 'read'
  const { data, isFetching } = useListMessagesQuery({ read, page })
  const [update] = useUpdateMessageMutation()
  const [remove] = useDeleteMessageMutation()

  const setRead = (m: ContactMessage, value: boolean) =>
    update({ id: m._id, read: value })
      .unwrap()
      .catch((err) => message.error(errorMessage(err)))

  return (
    <>
      <PageHeader
        title="Mesajlar"
        description="Kontakt formasından gələn mesajlar."
        sitePath="/#contact"
      />
      <SectionVisibility section="contact" name="Əlaqə" />
      <Segmented
        style={{ marginBottom: 16 }}
        value={filter}
        onChange={(v) => {
          setFilter(v as typeof filter)
          setPage(1)
        }}
        options={[
          { label: 'Hamısı', value: 'all' },
          { label: 'Oxunmamış', value: 'unread' },
          { label: 'Oxunmuş', value: 'read' },
        ]}
      />
      <Table<ContactMessage>
        rowKey="_id"
        loading={isFetching}
        dataSource={data?.items}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page,
          pageSize: data?.limit ?? 20,
          total: data?.total,
          onChange: setPage,
          showSizeChanger: false,
        }}
        expandable={{
          expandRowByClick: true,
          onExpand: (expanded, m) => {
            if (expanded && !m.read) void setRead(m, true)
          },
          expandedRowRender: (m) => (
            <div style={{ maxWidth: 720 }}>
              {m.phone && (
                <Typography.Paragraph type="secondary">
                  Telefon: <a href={`tel:${m.phone}`}>{m.phone}</a>
                </Typography.Paragraph>
              )}
              <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {m.message}
              </Typography.Paragraph>
              <Button
                type="primary"
                icon={<MailOutlined />}
                href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? 'Mesajınız'}`)}`}
              >
                Cavab yaz
              </Button>
            </div>
          ),
        }}
        columns={[
          {
            title: '',
            key: 'status',
            width: 32,
            render: (_, m) => (m.read ? null : <Badge status="processing" />),
          },
          {
            title: 'Göndərən',
            key: 'from',
            render: (_, m) => (
              <>
                <Typography.Text strong={!m.read}>{m.name}</Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {m.email}
                </Typography.Text>
              </>
            ),
          },
          {
            title: 'Mövzu',
            key: 'subject',
            render: (_, m) => (
              <Typography.Text
                strong={!m.read}
                ellipsis
                style={{ maxWidth: 360 }}
              >
                {m.subject || m.message.slice(0, 80)}
              </Typography.Text>
            ),
          },
          {
            title: 'Dil',
            dataIndex: 'locale',
            key: 'locale',
            width: 60,
            render: (l: string) => l.toUpperCase(),
          },
          {
            title: 'Tarix',
            key: 'date',
            width: 170,
            render: (_, m) => new Date(m.createdAt).toLocaleString('az'),
          },
          {
            title: '',
            key: 'actions',
            align: 'right',
            render: (_, m) => (
              <Flex
                gap={4}
                justify="flex-end"
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="small" onClick={() => setRead(m, !m.read)}>
                  {m.read ? 'Oxunmamış et' : 'Oxundu'}
                </Button>
                <Popconfirm
                  title="Mesaj silinsin?"
                  okText="Sil"
                  cancelText="Ləğv et"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    remove(m._id)
                      .unwrap()
                      .then(() => message.success('Silindi'))
                      .catch((err) => message.error(errorMessage(err)))
                  }
                >
                  <Tooltip title="Sil">
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </Flex>
            ),
          },
        ]}
      />
    </>
  )
}
