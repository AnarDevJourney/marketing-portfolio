import { MediaLibrary } from '../../components/admin/MediaLibrary'
import { PageHeader } from '../../components/admin/PageHeader'

export default function MediaPage() {
  return (
    <>
      <PageHeader
        title="Media kitabxanası"
        description="Bütün şəkil, video və fayllar. İstifadə olunan fayl silinə bilməz — əvvəlcə onu istifadə olunduğu yerdən çıxarın."
        sitePath={false}
      />
      <MediaLibrary />
    </>
  )
}
