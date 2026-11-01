/**
 * Page metadata (title, description, canonical, hreflang, Open Graph, Twitter, JSON-LD)
 * computed from API data. Pure — no React, no DOM — so the same code runs in the
 * browser (hooks/useSeo.ts) and in the build-time prerender (scripts/prerender.ts,
 * executed by Node with type stripping: keep imports type-only or with a .ts suffix).
 */
import type {
  Bootstrap,
  Locale,
  LocalizedString,
  Media,
  ProjectDetail,
  Settings,
} from '../api/types.ts'
import { localize, plainText } from './localized.ts'

export interface HeadTag {
  tag: 'meta' | 'link' | 'script'
  attrs: Record<string, string>
  /** Text content (JSON-LD). */
  text?: string
}

export interface PageSeo {
  lang: Locale
  title: string
  tags: HeadTag[]
}

export interface SeoContext {
  /** Public site origin without a trailing slash, e.g. https://domain.az */
  siteUrl: string
  locale: Locale
  defaultLocale: Locale
  enabled: Locale[]
  settings: Settings
}

export interface PageInput {
  /** Path without the locale prefix, e.g. "/" or "/work/slug". */
  path: string
  title: string
  description: string
  image?: Media | null
  type?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: Record<string, unknown>
}

const OG_LOCALE: Record<Locale, string> = {
  az: 'az_AZ',
  en: 'en_US',
  ru: 'ru_RU',
}

/** Same rule as the router: the default locale has no prefix. */
export function pathFor(path: string, locale: Locale, defaultLocale: Locale) {
  const clean = path === '/' ? '' : path
  return locale === defaultLocale ? clean || '/' : `/${locale}${clean}`
}

/** Plain-text excerpt (markdown / highlight markers removed) for meta descriptions. */
export function excerpt(text: string, max = 160) {
  const plain = plainText(text)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#_>`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= max) return plain
  const cut = plain.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`
}

export function buildSeo(ctx: SeoContext, page: PageInput): PageSeo {
  const { siteUrl, locale, defaultLocale, enabled, settings } = ctx
  const url = (l: Locale) => siteUrl + pathFor(page.path, l, defaultLocale)
  const alt = (v?: LocalizedString) => localize(v, locale, defaultLocale)
  const meta = (key: 'name' | 'property', id: string, content?: string) =>
    content ? [{ tag: 'meta' as const, attrs: { [key]: id, content } }] : []

  const tags: HeadTag[] = [
    ...meta('name', 'description', page.description),
    ...(page.noindex ? meta('name', 'robots', 'noindex') : []),
    {
      tag: 'link',
      attrs: {
        rel: 'icon',
        href: settings.favicon?.url ?? '/favicon.svg',
        ...(settings.favicon ? {} : { type: 'image/svg+xml' }),
      },
    },
  ]

  if (!page.noindex) {
    tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url(locale) } })
    for (const l of enabled) {
      tags.push({
        tag: 'link',
        attrs: { rel: 'alternate', hreflang: l, href: url(l) },
      })
    }
    tags.push({
      tag: 'link',
      attrs: {
        rel: 'alternate',
        hreflang: 'x-default',
        href: url(defaultLocale),
      },
    })
  }

  const image = page.image
  tags.push(
    ...meta('property', 'og:type', page.type ?? 'website'),
    ...meta('property', 'og:site_name', settings.siteName),
    ...meta('property', 'og:title', page.title),
    ...meta('property', 'og:description', page.description),
    ...meta('property', 'og:url', url(locale)),
    ...meta('property', 'og:locale', OG_LOCALE[locale]),
    ...enabled
      .filter((l) => l !== locale)
      .flatMap((l) => meta('property', 'og:locale:alternate', OG_LOCALE[l])),
    ...meta('property', 'og:image', image?.url),
    ...meta('property', 'og:image:width', image?.width?.toString()),
    ...meta('property', 'og:image:height', image?.height?.toString()),
    ...meta('property', 'og:image:alt', image ? alt(image.alt) : undefined),
    ...meta('name', 'twitter:card', image ? 'summary_large_image' : 'summary'),
    ...meta('name', 'twitter:title', page.title),
    ...meta('name', 'twitter:description', page.description),
    ...meta('name', 'twitter:image', image?.url),
  )

  if (page.jsonLd) {
    tags.push({
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      text: JSON.stringify(page.jsonLd),
    })
  }

  return { lang: locale, title: page.title, tags }
}

/** Home: settings.seo texts, falling back to the site name / about bio; Person JSON-LD. */
export function homePage(
  data: Bootstrap,
  locale: Locale,
  defaultLocale: Locale,
  siteUrl: string,
): PageInput {
  const l = (v?: LocalizedString) => localize(v, locale, defaultLocale)
  const { settings, about, hero } = data
  const title = plainText(l(settings.seo.title)) || settings.siteName
  const description =
    excerpt(l(settings.seo.description)) || excerpt(l(about.bio))
  const jobTitle = plainText(l(hero.eyebrow))
  return {
    path: '/',
    title,
    description,
    image: settings.seo.ogImage ?? about.photo,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: settings.siteName,
      url: siteUrl,
      ...(jobTitle ? { jobTitle } : {}),
      ...(description ? { description } : {}),
      ...(about.photo ? { image: about.photo.url } : {}),
      ...(settings.contact.email ? { email: settings.contact.email } : {}),
      ...(settings.socials.length
        ? { sameAs: settings.socials.map((s) => s.url) }
        : {}),
    },
  }
}

/** Case study: its own SEO fields, falling back to title — site name / summary / cover. */
export function projectPage(
  project: ProjectDetail,
  settings: Settings,
  locale: Locale,
  defaultLocale: Locale,
  siteUrl: string,
): PageInput {
  const l = (v?: LocalizedString) => localize(v, locale, defaultLocale)
  const title =
    plainText(l(project.seo?.title)) ||
    `${plainText(l(project.title))} — ${settings.siteName}`
  const description =
    excerpt(l(project.seo?.description)) || excerpt(l(project.summary))
  const path = `/work/${project.slug}`
  return {
    path,
    title,
    description,
    image: project.cover,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: plainText(l(project.title)),
      description,
      image: project.cover.url,
      url: siteUrl + pathFor(path, locale, defaultLocale),
      dateCreated: String(project.year),
      genre: l(project.category),
      author: { '@type': 'Person', name: settings.siteName, url: siteUrl },
    },
  }
}

export function notFoundPage(title: string, settings: Settings): PageInput {
  return {
    path: '/404',
    title: `${title} — ${settings.siteName}`,
    description: '',
    noindex: true,
  }
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** <title> + tags as HTML (prerender). Tags carry data-seo so the app can replace them. */
export function renderHead(seo: PageSeo) {
  const lines = [`<title data-seo>${escapeHtml(seo.title)}</title>`]
  for (const t of seo.tags) {
    const attrs = Object.entries(t.attrs)
      .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
      .join('')
    if (t.tag === 'script') {
      // "</" can't appear inside the inline script.
      const text = (t.text ?? '').replace(/</g, '\\u003c')
      lines.push(`<script data-seo${attrs}>${text}</script>`)
    } else {
      lines.push(`<${t.tag} data-seo${attrs} />`)
    }
  }
  return lines.join('\n    ')
}
