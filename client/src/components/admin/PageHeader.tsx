import { ExportOutlined } from '@ant-design/icons'
import { Button, Flex, Typography } from 'antd'
import type { ReactNode } from 'react'

/** Page title with a "View on site" link (new tab) and optional actions. */
export function PageHeader({
  title,
  description,
  sitePath = '/',
  extra,
}: {
  title: string
  description?: ReactNode
  sitePath?: string | false
  extra?: ReactNode
}) {
  return (
    <Flex
      justify="space-between"
      align="flex-start"
      gap={16}
      wrap
      style={{ marginBottom: 24 }}
    >
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description && (
          <Typography.Paragraph
            type="secondary"
            style={{ margin: '4px 0 0', maxWidth: 640 }}
          >
            {description}
          </Typography.Paragraph>
        )}
      </div>
      <Flex gap={8} wrap>
        {sitePath !== false && (
          <Button href={sitePath} target="_blank" icon={<ExportOutlined />}>
            Saytda bax
          </Button>
        )}
        {extra}
      </Flex>
    </Flex>
  )
}
