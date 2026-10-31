import type { Rule } from 'antd/es/form'
import type { LocalizedString } from '../api/types'
/** Form rule: the Azerbaijani (default) text is required. */
export const lsRequired = (label = 'Bu sahə'): Rule => ({
  validator: (_, v?: LocalizedString) =>
    v?.az?.trim()
      ? Promise.resolve()
      : Promise.reject(new Error(`${label}: AZ mətni məcburidir`)),
})
