import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useGetBootstrapQuery } from '../../api/publicApi'
import { HeroPreview } from '../../components/sections/HeroPreview'
import { SectionPlaceholder } from '../../components/sections/SectionPlaceholder'
import { scrollToTarget } from '../../lib/lenis'

/** One-page home: sections in the order configured in the admin. */
export default function HomePage() {
  const { data } = useGetBootstrapQuery()
  const { hash } = useLocation()

  // Arriving from another page via "/#work": scroll once the page is in place.
  useEffect(() => {
    if (!hash) return
    const id = setTimeout(() => scrollToTarget(hash), 400)
    return () => clearTimeout(id)
  }, [hash])

  if (!data) return null
  return (
    <>
      {data.sections.map((key, i) =>
        key === 'hero' ? (
          <HeroPreview
            key={key}
            hero={data.hero}
            siteName={data.settings.siteName}
          />
        ) : (
          <SectionPlaceholder key={key} id={key} index={i} />
        ),
      )}
    </>
  )
}
