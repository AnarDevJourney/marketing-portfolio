import { App, Button, Card, Flex, Skeleton, Switch, Typography } from 'antd'
import { useState } from 'react'
import { errorMessage } from '../../admin/utils'
import { aboutBody } from '../../admin/about'
import {
  useGetAboutQuery,
  useGetSettingsQuery,
  useUpdateAboutMutation,
  useUpdateSettingsMutation,
} from '../../api/adminApi'
import type { About, SectionKey, Settings } from '../../api/types'
import { PageHeader } from '../../components/admin/PageHeader'
import { SortableList } from '../../components/admin/SortableList'
import { useUnsavedChanges } from '../../components/admin/useUnsavedChanges'

const LABELS: Record<SectionKey, [string, string]> = {
  hero: ['Giriş (Hero)', 'Böyük başlıq və əsas düymə'],
  clients: ['Müştərilər', 'Loqoların sonsuz sırası'],
  about: ['Haqqımda', 'Foto, bio, rəqəmlər'],
  services: ['Xidmətlər', 'Xidmət kartları'],
  work: ['İşlər', 'Seçilmiş case study-lər'],
  testimonials: ['Rəylər', 'Müştəri sitatları'],
  contact: ['Əlaqə', 'Kontakt forması'],
}

type Section = Settings['sections'][number]

export default function SectionsPage() {
  const { data, isLoading } = useGetSettingsQuery()
  const { data: about, isLoading: aboutLoading } = useGetAboutQuery()
  if (isLoading || aboutLoading || !data || !about) return <Skeleton active />
  return (
    <SectionsEditor
      initial={[...data.sections].sort((a, b) => a.order - b.order)}
      about={about}
    />
  )
}

function SectionsEditor({
  initial,
  about,
}: {
  initial: Section[]
  about: About
}) {
  const { message } = App.useApp()
  const [sections, setSections] = useState(initial)
  // Experience + education live inside About (about.careerVisible), shown as its sub-row.
  const [careerVisible, setCareerVisible] = useState(
    about.careerVisible ?? true,
  )
  const [dirty, setDirty] = useState(false)
  const [save, { isLoading: savingSettings }] = useUpdateSettingsMutation()
  const [saveAbout, { isLoading: savingAbout }] = useUpdateAboutMutation()
  const isLoading = savingSettings || savingAbout
  useUnsavedChanges(dirty)

  const update = (next: Section[]) => {
    setSections(next)
    setDirty(true)
  }

  const submit = async () => {
    try {
      await save({
        sections: sections.map((s, order) => ({
          key: s.key,
          enabled: s.enabled,
          order,
        })),
      }).unwrap()
      if (careerVisible !== (about.careerVisible ?? true)) {
        await saveAbout(aboutBody({ ...about, careerVisible })).unwrap()
      }
      setDirty(false)
      message.success('Bölmələr yadda saxlandı')
    } catch (err) {
      message.error(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Bölmələr"
        description="Ana səhifədəki bölmələri sürükləyərək sıralayın, lazım olmayanları söndürün."
        extra={
          <Button
            type="primary"
            onClick={submit}
            loading={isLoading}
            disabled={!dirty}
          >
            Yadda saxla
          </Button>
        }
      />
      <SortableList
        items={sections}
        getId={(s) => s.key}
        onChange={update}
        renderItem={(s, handle) => (
          <>
            <Card size="small" style={{ opacity: s.enabled ? 1 : 0.55 }}>
              <Flex align="center" gap={12}>
                {handle}
                <div style={{ flex: 1 }}>
                  <Typography.Text strong>{LABELS[s.key][0]}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {LABELS[s.key][1]}
                  </Typography.Text>
                </div>
                <Switch
                  checked={s.enabled}
                  checkedChildren="Açıq"
                  unCheckedChildren="Bağlı"
                  onChange={(enabled) =>
                    update(
                      sections.map((x) =>
                        x.key === s.key ? { ...x, enabled } : x,
                      ),
                    )
                  }
                />
              </Flex>
            </Card>
            {s.key === 'about' && (
              <Card
                size="small"
                style={{
                  marginTop: 8,
                  marginLeft: 40,
                  opacity: s.enabled && careerVisible ? 1 : 0.55,
                }}
              >
                <Flex align="center" gap={12}>
                  <Typography.Text type="secondary">↳</Typography.Text>
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong>Təcrübə və təhsil</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                      Haqqımda bölməsinin içində, timeline
                    </Typography.Text>
                  </div>
                  <Switch
                    checked={careerVisible}
                    checkedChildren="Açıq"
                    unCheckedChildren="Bağlı"
                    onChange={(v) => {
                      setCareerVisible(v)
                      setDirty(true)
                    }}
                  />
                </Flex>
              </Card>
            )}
          </>
        )}
      />
    </>
  )
}
