import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { getToken, setToken } from '../../admin/auth'
import { errorMessage } from '../../admin/utils'
import { useLoginMutation } from '../../api/adminApi'

export default function LoginPage() {
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [error, setError] = useState<string | null>(null)
  if (getToken()) return <Navigate to="/admin" replace />

  const submit = async (values: { email: string; password: string }) => {
    setError(null)
    try {
      const { accessToken } = await login(values).unwrap()
      setToken(accessToken)
      void navigate('/admin', { replace: true })
    } catch (err) {
      const status = (err as { status?: number }).status
      setError(
        status === 401 ? 'Email və ya parol yanlışdır' : errorMessage(err),
      )
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 380 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Admin panel
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Saytın məzmununu idarə etmək üçün daxil olun.
        </Typography.Paragraph>
        {error && (
          <Alert
            type="error"
            showIcon
            title={error}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form layout="vertical" onFinish={submit} requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: 'email',
                message: 'Düzgün email daxil edin',
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              autoComplete="username"
              autoFocus
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: 'Parolu daxil edin' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoading}>
            Daxil ol
          </Button>
        </Form>
      </Card>
    </div>
  )
}
