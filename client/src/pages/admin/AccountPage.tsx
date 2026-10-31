import { App, Button, Card, Form, Input } from 'antd'
import { setToken } from '../../admin/auth'
import { errorMessage } from '../../admin/utils'
import { useChangePasswordMutation, useMeQuery } from '../../api/adminApi'
import { PageHeader } from '../../components/admin/PageHeader'

export default function AccountPage() {
  const { message } = App.useApp()
  const { data: me } = useMeQuery()
  const [change, { isLoading }] = useChangePasswordMutation()
  const [form] = Form.useForm()

  const submit = async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string
    newPassword: string
  }) => {
    try {
      const { accessToken } = await change({
        currentPassword,
        newPassword,
      }).unwrap()
      setToken(accessToken)
      form.resetFields()
      message.success('Parol dəyişdirildi')
    } catch (err) {
      const status = (err as { status?: number }).status
      message.error(
        status === 401 ? 'Hazırkı parol yanlışdır' : errorMessage(err),
      )
    }
  }

  return (
    <>
      <PageHeader title="Hesab" description={me?.email} sitePath={false} />
      <Card title="Parolu dəyiş" style={{ maxWidth: 480 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          requiredMark={false}
        >
          <Form.Item
            name="currentPassword"
            label="Hazırkı parol"
            rules={[{ required: true, message: 'Hazırkı parolu daxil edin' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Yeni parol"
            rules={[{ required: true, min: 8, message: 'Ən azı 8 simvol' }]}
            hasFeedback
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Yeni parol (təkrar)"
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: 'Parolu təkrar daxil edin' },
              ({ getFieldValue }) => ({
                validator: (_, v) =>
                  v === getFieldValue('newPassword')
                    ? Promise.resolve()
                    : Promise.reject(new Error('Parollar eyni deyil')),
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Parolu dəyiş
          </Button>
        </Form>
      </Card>
    </>
  )
}
