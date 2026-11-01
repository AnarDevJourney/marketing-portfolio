import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { Alert, App, Switch } from 'antd'
import { errorMessage } from '../../admin/utils'
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '../../api/adminApi'
import type { SectionKey } from '../../api/types'

/** Green/yellow banner with an on/off switch; `onChange` persists the new state. */
export function VisibilityBanner({
  name,
  visible,
  loading,
  onChange,
  hiddenFrom = 'saytda, üst menyuda və açılan menyuda',
  note,
}: {
  name: string
  visible: boolean
  loading?: boolean
  onChange: (visible: boolean) => Promise<unknown>
  /** Where the part disappears from, e.g. "saytda". */
  hiddenFrom?: string
  /** Extra sentence after the description. */
  note?: string
}) {
  const { message } = App.useApp()

  const toggle = async (next: boolean) => {
    try {
      await onChange(next)
      message.success(
        next
          ? `"${name}" bölməsi saytda göstərilir`
          : `"${name}" bölməsi gizlədildi`,
      )
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  return (
    <Alert
      type={visible ? 'success' : 'warning'}
      showIcon
      icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
      style={{ marginBottom: 16 }}
      title={
        visible
          ? `"${name}" bölməsi saytda görünür`
          : `"${name}" bölməsi gizlidir`
      }
      description={
        visible
          ? `Söndürsəniz bölmə ${hiddenFrom} görünməyəcək. ${note ? `${note} ` : ''}Məlumatlar silinmir.`
          : `Bölmə ${hiddenFrom} görünmür. ${note ? `${note} ` : ''}Məlumatlar saxlanılır — istənilən vaxt geri qaytara bilərsiniz.`
      }
      action={
        <Switch
          checked={visible}
          loading={loading}
          checkedChildren="Açıq"
          unCheckedChildren="Bağlı"
          onChange={toggle}
        />
      }
    />
  )
}

/**
 * Show/hide a whole home-page section from its content page. Same flag as the switch on
 * the "Bölmələr" page (settings.sections[].enabled): a hidden section disappears from the
 * page, the top bar and the full-screen menu. Its items are kept.
 */
export function SectionVisibility({
  section,
  name,
}: {
  section: SectionKey
  name: string
}) {
  const { data } = useGetSettingsQuery()
  const [save, { isLoading }] = useUpdateSettingsMutation()
  const entry = data?.sections.find((s) => s.key === section)
  if (!data || !entry) return null

  return (
    <VisibilityBanner
      name={name}
      visible={entry.enabled}
      loading={isLoading}
      onChange={(enabled) =>
        // The API expects every section in the list; only this one changes.
        save({
          sections: data.sections.map(({ key, order, enabled: on }) => ({
            key,
            order,
            enabled: key === section ? enabled : on,
          })),
        }).unwrap()
      }
    />
  )
}
