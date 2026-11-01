import { useEffect } from 'react'
import { useGetBootstrapQuery } from '../api/publicApi'
import type { Bootstrap } from '../api/types'
import { buildSeo, type PageInput, type PageSeo } from '../lib/seo'
import { useLocale } from './useLocale'

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || window.location.origin
).replace(/\/$/, '')

/** Replaces every head tag marked data-seo (also those written by the prerender). */
function applySeo(seo: PageSeo) {
  document.title = seo.title
  document.documentElement.lang = seo.lang
  const head = document.head
  head.querySelectorAll('[data-seo]').forEach((el) => {
    if (el.tagName !== 'TITLE') el.remove()
  })
  const title = head.querySelector('title')
  if (title) title.setAttribute('data-seo', '')
  for (const t of seo.tags) {
    const el = document.createElement(t.tag)
    el.setAttribute('data-seo', '')
    for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v)
    if (t.text) el.textContent = t.text
    head.appendChild(el)
  }
}

/**
 * Sets the page's head metadata. `build` gets the bootstrap data and returns the
 * page's input (or null while its own data is loading).
 */
export function useSeo(build: (data: Bootstrap) => PageInput | null) {
  const { data } = useGetBootstrapQuery()
  const { locale, defaultLocale, enabled } = useLocale()
  const page = data ? build(data) : null
  const seo =
    data && page
      ? buildSeo(
          {
            siteUrl: SITE_URL,
            locale,
            defaultLocale,
            enabled,
            settings: data.settings,
          },
          page,
        )
      : null
  const key = seo ? JSON.stringify(seo) : null

  useEffect(() => {
    if (key) applySeo(JSON.parse(key) as PageSeo)
  }, [key])
}
