import { App, Button, Card, Col, Form, Row, Switch } from 'antd'
import { useState } from 'react'
import { lsRequired } from '../../admin/rules'
import { errorMessage } from '../../admin/utils'
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '../../api/adminApi'
import type { Settings } from '../../api/types'
import { LocalizedInput } from './LocalizedInput'

/** Titles of the two Work tabs + on/off. Saved to settings.workGroups. */
export function WorkGroupsCard() {
  const { data } = useGetSettingsQuery()
  if (!data) return null
  return <WorkGroupsForm initial={data.workGroups} />
}

function WorkGroupsForm({ initial }: { initial: Settings['workGroups'] }) {
  const { message } = App.useApp()
  const [form] = Form.useForm<Settings['workGroups']>()
  const [dirty, setDirty] = useState(false)
  const [save, { isLoading }] = useUpdateSettingsMutation()
  const enabled = Form.useWatch('enabled', form) ?? initial.enabled

  const submit = async (workGroups: Settings['workGroups']) => {
    try {
      await save({ workGroups }).unwrap()
      setDirty(false)
      message.success('Qruplar yadda saxlandı')
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  return (
    <Card
      title="Qruplar"
      style={{ marginBottom: 16 }}
      extra={
        <Button
          type="primary"
          size="small"
          onClick={() => form.submit()}
          loading={isLoading}
          disabled={!dirty}
        >
          Yadda saxla
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initial}
        onFinish={submit}
        onValuesChange={() => setDirty(true)}
      >
        <Form.Item
          name="enabled"
          label="İşləri iki qrupa böl"
          valuePropName="checked"
          extra="Açıq olanda saytda başlığın altında iki düymə görünür və hər qrupun işləri ayrıca göstərilir. Bağlı olanda bütün işlər bir siyahıdadır."
        >
          <Switch checkedChildren="Açıq" unCheckedChildren="Bağlı" />
        </Form.Item>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="primary"
              label="1-ci qrupun adı"
              rules={enabled ? [lsRequired('Qrupun adı')] : []}
              style={{ marginBottom: 0 }}
            >
              <LocalizedInput maxLength={60} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="secondary"
              label="2-ci qrupun adı"
              rules={enabled ? [lsRequired('Qrupun adı')] : []}
              style={{ marginBottom: 0 }}
            >
              <LocalizedInput maxLength={60} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}
