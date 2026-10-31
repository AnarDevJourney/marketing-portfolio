import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import az from './az.json'
import en from './en.json'
import ru from './ru.json'

// Static UI strings only; DB content uses LocalizedString + useLocalized().
void i18n.use(initReactI18next).init({
  resources: {
    az: { translation: az },
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: 'az',
  fallbackLng: 'az',
  interpolation: { escapeValue: false },
})

export default i18n
