import { ExclamationCircleFilled } from '@ant-design/icons'
import { Input, Tabs, Tooltip } from 'antd'
import { LOCALES, type LocalizedString } from '../../api/types'
import { emptyLs, LOCALE_LABELS } from '../../admin/utils'

interface LocalizedInputProps {
  value?: LocalizedString
  onChange?: (value: LocalizedString) => void
  /** Number of textarea rows; omit for a single-line input. */
  rows?: number
  placeholder?: string
  maxLength?: number
}

/**
 * AZ / EN / RU tabs for one translatable field. Languages left empty get a
 * warning icon (the site falls back to the default language for them).
 */
export function LocalizedInput({
  value,
  onChange,
  rows,
  placeholder,
  maxLength,
}: LocalizedInputProps) {
  const current = value ?? emptyLs()
  return (
    <Tabs
      size="small"
      className="admin-ls-tabs"
      items={LOCALES.map((locale) => {
        const missing = !current[locale]?.trim()
        const props = {
          value: current[locale],
          placeholder,
          maxLength,
          onChange: (e: { target: { value: string } }) =>
            onChange?.({ ...current, [locale]: e.target.value }),
        }
        return {
          key: locale,
          label: (
            <span>
              {LOCALE_LABELS[locale]}{' '}
              {missing && (
                <Tooltip title="Bu dildə mətn yoxdur — saytda əsas dil göstəriləcək">
                  <ExclamationCircleFilled style={{ color: '#faad14' }} />
                </Tooltip>
              )}
            </span>
          ),
          children: rows ? (
            <Input.TextArea
              {...props}
              autoSize={{ minRows: rows, maxRows: rows * 4 }}
            />
          ) : (
            <Input {...props} />
          ),
        }
      })}
    />
  )
}
