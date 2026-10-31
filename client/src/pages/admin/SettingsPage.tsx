import {
  CheckCircleFilled,
  DeleteOutlined,
  PlusOutlined,
  WarningFilled,
} from '@ant-design/icons'
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  ColorPicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Skeleton,
  Switch,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { useEffect, useState } from 'react'
import { contrastRatio, errorMessage, toId } from '../../admin/utils'
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '../../api/adminApi'
import type { ColorKey, FontChoice, Settings } from '../../api/types'
import { lsRequired } from '../../admin/rules'
import { LocalizedInput } from '../../components/admin/LocalizedInput'
import { MediaPicker } from '../../components/admin/MediaPicker'
import { PageHeader } from '../../components/admin/PageHeader'
import { useUnsavedChanges } from '../../components/admin/useUnsavedChanges'
import { loadFonts } from '../../theme/fonts'

const COLOR_FIELDS: { key: ColorKey; label: string; hint: string }[] = [
  { key: 'background', label: 'Fon', hint: 'Səhifənin əsas fonu' },
  { key: 'surface', label: 'Səth', hint: 'Kartlar, menyu, inputlar' },
  { key: 'text', label: 'Mətn', hint: 'Əsas mətn rəngi' },
  {
    key: 'primary',
    label: 'Əsas (siqnal)',
    hint: 'Düymələr, marker, vurğular',
  },
  { key: 'accent', label: 'Aksent', hint: 'Kursor və kiçik detallar' },
]

const HEADING_FONTS = [
  { value: 'unbounded', label: 'Unbounded — enli, cəsarətli' },
  { value: 'geologica', label: 'Geologica — müasir, təmiz' },
  { value: 'playfair-display', label: 'Playfair Display — klassik, editorial' },
]
const BODY_FONTS = [
  { value: 'onest', label: 'Onest' },
  { value: 'inter', label: 'Inter' },
  { value: 'commissioner', label: 'Commissioner' },
]
const PLATFORMS = [
  'instagram',
  'linkedin',
  'behance',
  'tiktok',
  'x',
  'youtube',
].map((p) => ({
  value: p,
  label: {
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    behance: 'Behance',
    tiktok: 'TikTok',
    x: 'X (Twitter)',
    youtube: 'YouTube',
  }[p],
}))
const LOCALE_OPTIONS = [
  { value: 'az', label: 'Azərbaycan' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
]
const FEATURES = [
  {
    key: 'customCursor',
    label: 'Xüsusi kursor',
    hint: 'Kompüterdə dairəvi kursor; telefonlarda avtomatik söndürülür',
  },
  {
    key: 'preloader',
    label: 'Giriş animasiyası',
    hint: 'İlk açılışda qısa sayğaclı intro (sessiyada 1 dəfə)',
  },
  {
    key: 'smoothScroll',
    label: 'Hamar scroll',
    hint: 'Yumşaq, axıcı sürüşmə effekti',
  },
] as const

export default function SettingsPage() {
  const { message } = App.useApp()
  const { data, isLoading } = useGetSettingsQuery()
  const [save, { isLoading: saving }] = useUpdateSettingsMutation()
  const [form] = Form.useForm<Settings>()
  const [dirty, setDirty] = useState(false)
  useUnsavedChanges(dirty)

  const colors = Form.useWatch('colors', form) as Settings['colors'] | undefined
  const font = Form.useWatch('font', form) as FontChoice | undefined

  // Load the chosen fonts so the preview shows them.
  useEffect(() => {
    if (font?.heading && font?.body) loadFonts(font)
  }, [font])

  if (isLoading || !data) return <Skeleton active />

  const submit = async (values: Settings) => {
    try {
      await save({
        ...values,
        logo: toId(values.logo),
        logoDark: toId(values.logoDark),
        favicon: toId(values.favicon),
        seo: { ...values.seo, ogImage: toId(values.seo.ogImage) },
        contact: {
          ...values.contact,
          phone: values.contact.phone || undefined,
        },
      }).unwrap()
      setDirty(false)
      message.success('Parametrlər yadda saxlandı — saytda dərhal görünəcək')
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  const textContrast = colors
    ? contrastRatio(colors.text, colors.background)
    : 0
  const primaryContrast = colors
    ? contrastRatio(colors.primary, colors.background)
    : 0

  return (
    <>
      <PageHeader
        title="Parametrlər"
        description="Saytın adı, rəngləri, şriftləri, əlaqə məlumatları və SEO."
        extra={
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={saving}
            disabled={!dirty}
          >
            Yadda saxla
          </Button>
        }
      />
      <Form
        form={form}
        layout="vertical"
        initialValues={data}
        onFinish={submit}
        onValuesChange={() => setDirty(true)}
        onFinishFailed={() =>
          message.error('Bəzi sahələr düzgün doldurulmayıb')
        }
        scrollToFirstError
      >
        <Card>
          <Tabs
            items={[
              {
                key: 'general',
                label: 'Ümumi',
                forceRender: true,
                children: (
                  <>
                    <Form.Item
                      name="siteName"
                      label="Saytın adı"
                      rules={[{ required: true, message: 'Ad məcburidir' }]}
                    >
                      <Input maxLength={100} style={{ maxWidth: 400 }} />
                    </Form.Item>
                    <Row gutter={24}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="logo"
                          label="Loqo"
                          extra="Şəffaf fonlu PNG və ya WebP. Boş qalsa sayt adı yazılır."
                        >
                          <MediaPicker />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="logoDark" label="Loqo (açıq fon üçün)">
                          <MediaPicker />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name="favicon"
                          label="Favicon"
                          extra="Kvadrat şəkil, ən azı 512×512."
                        >
                          <MediaPicker />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
              {
                key: 'theme',
                label: 'Rənglər və şrift',
                forceRender: true,
                children: (
                  <Row gutter={32}>
                    <Col xs={24} lg={12}>
                      {COLOR_FIELDS.map(({ key, label, hint }) => (
                        <Form.Item
                          key={key}
                          name={['colors', key]}
                          label={label}
                          extra={hint}
                          getValueFromEvent={(c) => c.toHexString()}
                        >
                          <ColorPicker disabledAlpha showText format="hex" />
                        </Form.Item>
                      ))}
                      <Flex vertical gap={6} style={{ marginBottom: 24 }}>
                        <ContrastTag
                          label="Mətn / fon"
                          ratio={textContrast}
                          min={4.5}
                        />
                        <ContrastTag
                          label="Əsas rəng / fon"
                          ratio={primaryContrast}
                          min={3}
                        />
                      </Flex>
                      <Form.Item
                        name={['font', 'heading']}
                        label="Başlıq şrifti"
                      >
                        <Select
                          options={HEADING_FONTS}
                          style={{ maxWidth: 360 }}
                        />
                      </Form.Item>
                      <Form.Item name={['font', 'body']} label="Mətn şrifti">
                        <Select
                          options={BODY_FONTS}
                          style={{ maxWidth: 360 }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Typography.Text type="secondary">
                        Canlı önizləmə
                      </Typography.Text>
                      {colors && (
                        <ThemePreview
                          colors={colors}
                          siteName={form.getFieldValue('siteName')}
                        />
                      )}
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'contact',
                label: 'Əlaqə və sosial',
                forceRender: true,
                children: (
                  <>
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name={['contact', 'email']}
                          label="Email"
                          rules={[
                            {
                              required: true,
                              type: 'email',
                              message: 'Düzgün email daxil edin',
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name={['contact', 'phone']}
                          label="Telefon (istəyə bağlı)"
                        >
                          <Input maxLength={40} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name={['contact', 'location']}
                      label="Yer"
                      rules={[lsRequired('Yer')]}
                    >
                      <LocalizedInput />
                    </Form.Item>
                    <Typography.Title level={5}>
                      Sosial şəbəkələr
                    </Typography.Title>
                    <Form.List name="socials">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field) => (
                            <Flex key={field.key} gap={8} align="flex-start">
                              <Form.Item
                                name={[field.name, 'platform']}
                                rules={[{ required: true, message: 'Seçin' }]}
                                style={{ width: 180 }}
                              >
                                <Select
                                  options={PLATFORMS}
                                  placeholder="Platforma"
                                />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'url']}
                                rules={[
                                  {
                                    required: true,
                                    type: 'url',
                                    message: 'https:// ilə başlayan link',
                                  },
                                ]}
                                style={{ flex: 1 }}
                              >
                                <Input placeholder="https://instagram.com/..." />
                              </Form.Item>
                              <Button
                                icon={<DeleteOutlined />}
                                onClick={() => remove(field.name)}
                                aria-label="Sil"
                              />
                            </Flex>
                          ))}
                          <Button
                            icon={<PlusOutlined />}
                            onClick={() =>
                              add({ platform: undefined, url: '' })
                            }
                            disabled={fields.length >= 12}
                          >
                            Sosial şəbəkə əlavə et
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </>
                ),
              },
              {
                key: 'locales',
                label: 'Dillər',
                forceRender: true,
                children: (
                  <>
                    <Form.Item
                      name={['locales', 'enabled']}
                      label="Aktiv dillər"
                      rules={[
                        {
                          required: true,
                          type: 'array',
                          min: 1,
                          message: 'Ən azı bir dil seçin',
                        },
                      ]}
                    >
                      <Checkbox.Group options={LOCALE_OPTIONS} />
                    </Form.Item>
                    <Form.Item
                      name={['locales', 'default']}
                      label="Əsas dil"
                      extra="Ünvanında dil olmayan səhifələr bu dildə açılır. Boş qalan tərcümələrin yerinə də bu dil göstərilir."
                      dependencies={[['locales', 'enabled']]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator: (_, v) =>
                            (
                              getFieldValue(['locales', 'enabled']) ?? []
                            ).includes(v)
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error(
                                    'Əsas dil aktiv dillərdən biri olmalıdır',
                                  ),
                                ),
                        }),
                      ]}
                    >
                      <Select
                        options={LOCALE_OPTIONS}
                        style={{ maxWidth: 240 }}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'features',
                label: 'Effektlər',
                forceRender: true,
                children: FEATURES.map(({ key, label, hint }) => (
                  <Form.Item
                    key={key}
                    name={['features', key]}
                    label={label}
                    extra={hint}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                )),
              },
              {
                key: 'seo',
                label: 'SEO',
                forceRender: true,
                children: (
                  <>
                    <Form.Item
                      name={['seo', 'title']}
                      label="Başlıq (Google və sosial şəbəkələrdə)"
                      extra="60 simvola qədər tövsiyə olunur."
                      rules={[lsRequired('SEO başlığı')]}
                    >
                      <LocalizedInput maxLength={120} />
                    </Form.Item>
                    <Form.Item
                      name={['seo', 'description']}
                      label="Təsvir"
                      extra="150–160 simvol tövsiyə olunur."
                    >
                      <LocalizedInput rows={3} maxLength={300} />
                    </Form.Item>
                    <Form.Item
                      name={['seo', 'ogImage']}
                      label="Paylaşım şəkli"
                      extra="Linki paylaşanda görünür. 1200×630 tövsiyə olunur."
                    >
                      <MediaPicker />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Card>
      </Form>
    </>
  )
}

function ContrastTag({
  label,
  ratio,
  min,
}: {
  label: string
  ratio: number
  min: number
}) {
  const ok = ratio >= min
  return (
    <span>
      <Tag
        color={ok ? 'success' : 'warning'}
        icon={ok ? <CheckCircleFilled /> : <WarningFilled />}
      >
        {label}: {ratio.toFixed(1)}:1
      </Tag>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {ok
          ? 'Oxunaqlıdır'
          : `Zəif kontrast — ən azı ${min}:1 tövsiyə olunur (WCAG AA)`}
      </Typography.Text>
    </span>
  )
}

/** Mini mock of the site with the chosen colors and fonts. */
function ThemePreview({
  colors,
  siteName,
}: {
  colors: Settings['colors']
  siteName?: string
}) {
  return (
    <div
      style={{
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
        background: colors.background,
        color: colors.text,
        padding: 28,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          opacity: 0.8,
          marginBottom: 32,
        }}
      >
        <span style={{ fontFamily: 'var(--heading-family)' }}>{siteName}</span>
        <span>Menyu ≡</span>
      </div>
      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
      >
        (01) — Xidmətlər
      </div>
      <div
        style={{
          fontFamily: 'var(--heading-family)',
          fontSize: 34,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          margin: '16px 0 20px',
        }}
      >
        Brendləri{' '}
        <span style={{ position: 'relative', zIndex: 0 }}>
          <span
            style={{
              position: 'absolute',
              left: '-0.05em',
              right: '-0.05em',
              bottom: '0.05em',
              height: '0.42em',
              background: colors.primary,
              zIndex: -1,
              transform: 'skewX(-6deg)',
            }}
          />
          hekayəyə
        </span>{' '}
        çevirirəm
      </div>
      <div
        style={{
          background: colors.surface,
          borderRadius: 8,
          padding: 16,
          fontFamily: 'var(--body-family)',
          fontSize: 14,
          opacity: 0.95,
        }}
      >
        Strategiya, kontent və performans marketinqi.
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: 99,
            background: colors.accent,
            marginLeft: 8,
          }}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <span
          style={{
            display: 'inline-block',
            background: colors.primary,
            color: colors.background,
            borderRadius: 99,
            padding: '10px 20px',
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Əlaqə
        </span>
      </div>
    </div>
  )
}
