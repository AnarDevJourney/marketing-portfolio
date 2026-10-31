import {
  FileImageOutlined,
  MailOutlined,
  PlusOutlined,
  ProjectOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Flex, Row, Statistic, Typography } from 'antd'
import { Link } from 'react-router'
import { formatBytes } from '../../admin/utils'
import { useMeQuery, useStatsQuery } from '../../api/adminApi'
import { PageHeader } from '../../components/admin/PageHeader'

export default function DashboardPage() {
  const { data: stats, isLoading } = useStatsQuery()
  const { data: me } = useMeQuery()

  return (
    <>
      <PageHeader
        title="Xoş gəlmisiniz 👋"
        description={
          me?.lastLoginAt
            ? `Son giriş: ${new Date(me.lastLoginAt).toLocaleString('az')}`
            : undefined
        }
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card loading={isLoading}>
            <Statistic
              title="Oxunmamış mesajlar"
              value={stats?.unreadMessages ?? 0}
              prefix={<MailOutlined />}
            />
            <Link to="/admin/messages">Mesajlara bax →</Link>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={isLoading}>
            <Statistic
              title="Case study-lər (dərc olunub / cəmi)"
              value={stats?.projects.published ?? 0}
              suffix={`/ ${stats?.projects.total ?? 0}`}
              prefix={<ProjectOutlined />}
            />
            <Link to="/admin/projects">Layihələrə bax →</Link>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={isLoading}>
            <Statistic
              title="Media faylları"
              value={stats?.media.count ?? 0}
              prefix={<FileImageOutlined />}
            />
            <Typography.Text type="secondary">
              Ümumi həcm: {formatBytes(stats?.media.totalSize ?? 0)}
            </Typography.Text>
          </Card>
        </Col>
      </Row>
      <Card title="Tez keçidlər" style={{ marginTop: 16 }}>
        <Flex gap={12} wrap>
          <Link to="/admin/projects/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Yeni case study
            </Button>
          </Link>
          <Link to="/admin/hero">
            <Button>Hero mətnini dəyiş</Button>
          </Link>
          <Link to="/admin/settings">
            <Button>Rəngləri dəyiş</Button>
          </Link>
          <Link to="/admin/media">
            <Button>Şəkil yüklə</Button>
          </Link>
        </Flex>
      </Card>
    </>
  )
}
