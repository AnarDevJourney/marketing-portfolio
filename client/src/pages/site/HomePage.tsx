import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useGetBootstrapQuery } from '../../api/publicApi'
import type { SectionKey } from '../../api/types'
import { About } from '../../components/sections/About'
import { Clients } from '../../components/sections/Clients'
import { Contact } from '../../components/sections/Contact'
import { Hero } from '../../components/sections/Hero'
import { Services } from '../../components/sections/Services'
import { Testimonials } from '../../components/sections/Testimonials'
import { Work } from '../../components/sections/Work'
import { scrollToTarget } from '../../lib/lenis'

/** One-page home: sections in the order (and on/off state) configured in the admin. */
export default function HomePage() {
  const { data } = useGetBootstrapQuery()
  const { hash } = useLocation()

  // Arriving from another page via "/#work": scroll once the page is in place.
  useEffect(() => {
    if (!hash) return
    const id = setTimeout(() => scrollToTarget(hash), 500)
    return () => clearTimeout(id)
  }, [hash])

  if (!data) return null
  // Section numbers "(01)…" count the sections after the hero.
  const numbered: SectionKey[] = data.sections.filter((k) => k !== 'hero')
  const index = (key: SectionKey) => numbered.indexOf(key) + 1

  return (
    <>
      {data.sections.map((key) => {
        switch (key) {
          case 'hero':
            return <Hero key={key} hero={data.hero} />
          case 'clients':
            return <Clients key={key} index={index(key)} />
          case 'about':
            return <About key={key} about={data.about} index={index(key)} />
          case 'services':
            return <Services key={key} index={index(key)} />
          case 'work':
            return <Work key={key} index={index(key)} />
          case 'testimonials':
            return <Testimonials key={key} index={index(key)} />
          case 'contact':
            return (
              <Contact key={key} settings={data.settings} index={index(key)} />
            )
        }
      })}
    </>
  )
}
