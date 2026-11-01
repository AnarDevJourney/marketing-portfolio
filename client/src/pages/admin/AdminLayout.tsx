import {
  AppstoreOutlined,
  CommentOutlined,
  DashboardOutlined,
  ExportOutlined,
  FileImageOutlined,
  LogoutOutlined,
  MailOutlined,
  OrderedListOutlined,
  ProjectOutlined,
  ReadOutlined,
  SettingOutlined,
  StarOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Badge, Button, Flex, Layout, Menu, Spin, Typography } from 'antd'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { getToken, setToken } from '../../admin/auth'
import { adminApi, useMeQuery, useStatsQuery } from '../../api/adminApi'
import { adminStore } from '../../admin/store'

/** Redirects to the login page without a token; validates the token once via /auth/me. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const token = getToken()
  const { isLoading, isError } = useMeQuery(undefined, { skip: !token })
  if (!token || isError) return <Navigate to="/admin/login" replace />
  if (isLoading) return <Spin fullscreen />
  return children
}

const link = (to: string, label: string) => <Link to={to}>{label}</Link>

export function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const { data: me } = useMeQuery()
  const { data: stats } = useStatsQuery(undefined, { pollingInterval: 60_000 })

  const logout = () => {
    setToken(null)
    adminStore.dispatch(adminApi.util.resetApiState())
    void navigate('/admin/login')
  }

  const items = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: link('/admin', 'İdarə paneli'),
    },
    {
      type: 'group' as const,
      label: 'Məzmun',
      children: [
        {
          key: '/admin/hero',
          icon: <ThunderboltOutlined />,
          label: link('/admin/hero', 'Hero'),
        },
        {
          key: '/admin/about',
          icon: <UserOutlined />,
          label: link('/admin/about', 'Haqqımda'),
        },
        {
          key: '/admin/career',
          icon: <ReadOutlined />,
          label: link('/admin/career', 'Təcrübə və təhsil'),
        },
        {
          key: '/admin/projects',
          icon: <ProjectOutlined />,
          label: link('/admin/projects', 'Case study-lər'),
        },
        {
          key: '/admin/services',
          icon: <AppstoreOutlined />,
          label: link('/admin/services', 'Xidmətlər'),
        },
        {
          key: '/admin/clients',
          icon: <TeamOutlined />,
          label: link('/admin/clients', 'Müştərilər'),
        },
        {
          key: '/admin/testimonials',
          icon: <StarOutlined />,
          label: link('/admin/testimonials', 'Rəylər'),
        },
      ],
    },
    {
      type: 'group' as const,
      label: 'Sayt',
      children: [
        {
          key: '/admin/sections',
          icon: <OrderedListOutlined />,
          label: link('/admin/sections', 'Bölmələr'),
        },
        {
          key: '/admin/settings',
          icon: <SettingOutlined />,
          label: link('/admin/settings', 'Parametrlər'),
        },
        {
          key: '/admin/media',
          icon: <FileImageOutlined />,
          label: link('/admin/media', 'Media kitabxanası'),
        },
        {
          key: '/admin/messages',
          icon: <MailOutlined />,
          label: (
            <Link to="/admin/messages">
              <Flex justify="space-between" align="center">
                Mesajlar <Badge count={stats?.unreadMessages} size="small" />
              </Flex>
            </Link>
          ),
        },
        {
          key: '/admin/account',
          icon: <CommentOutlined />,
          label: link('/admin/account', 'Hesab'),
        },
      ],
    },
  ]
  // Highlight the closest menu entry (e.g. /admin/projects/123 -> Case study-lər).
  const selected =
    [
      '/admin/projects',
      '/admin/hero',
      '/admin/about',
      '/admin/career',
      '/admin/services',
      '/admin/clients',
      '/admin/testimonials',
      '/admin/sections',
      '/admin/settings',
      '/admin/media',
      '/admin/messages',
      '/admin/account',
    ].find((k) => pathname.startsWith(k)) ?? '/admin'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        theme="light"
        breakpoint="lg"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={232}
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            padding: '20px 24px 12px',
            fontWeight: 700,
            fontSize: 16,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? 'A' : 'Admin panel'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          items={items}
          style={{ borderInlineEnd: 0 }}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <Button
            type="link"
            href="/"
            target="_blank"
            icon={<ExportOutlined />}
          >
            Sayta keç
          </Button>
          <Typography.Text type="secondary">{me?.email}</Typography.Text>
          <Button icon={<LogoutOutlined />} onClick={logout}>
            Çıxış
          </Button>
        </Layout.Header>
        <Layout.Content style={{ padding: 24 }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
