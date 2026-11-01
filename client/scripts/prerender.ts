/**
 * Post-build prerender (run by `npm run build`, Node strips the types):
 * writes a static HTML file per public route with its final <head> — title,
 * description, canonical, hreflang, Open Graph/Twitter, JSON-LD — plus the
 * page's main text for crawlers, and generates sitemap.xml + robots.txt.
 * Head data comes from src/lib/seo.ts, the same code the app uses at runtime.
 *
 *   dist/index.html, dist/en.html, dist/ru.html          home per locale
 *   dist/work/<slug>.html, dist/en/work/<slug>.html, ...  case studies
 *   dist/spa.html                                         untouched shell (SPA fallback, see _redirects)
 *
 * Needs the API (VITE_API_URL). If it can't be reached the build still succeeds with
 * the plain shell, unless PRERENDER_STRICT=1 (set on Netlify) — then it fails.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import type {
  Bootstrap,
  Locale,
  Media,
  ProjectCard,
  ProjectDetail,
} from '../src/api/types.ts'
import { localize, plainText } from '../src/lib/localized.ts'
import { srcSet } from '../src/lib/media.ts'
import {
  buildSeo,
  excerpt,
  homePage,
  pathFor,
  projectPage,
  renderHead,
} from '../src/lib/seo.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const env = { ...loadEnv('production', root, ''), ...process.env }
const api = (env.VITE_API_URL ?? '').replace(/\/$/, '')
const siteUrl = (env.VITE_SITE_URL || 'https://domain.az').replace(/\/$/, '')
const strict = env.PRERENDER_STRICT === '1'

const SEO_BLOCK = /<!-- seo:[\s\S]*?<!-- \/seo -->/

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${api}/public${path}`, {
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return (await res.json()) as T
}

async function write(path: string, content: string) {
  const file = join(dist, path)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, content)
}

/**
 * Route file for a site path: "/" -> index.html, "/en/work/x" -> en/work/x.html.
 * Netlify serves x.html at /x (no trailing-slash redirect), matching the canonical URLs.
 */
const fileFor = (sitePath: string) =>
  sitePath === '/' ? 'index.html' : `${sitePath.slice(1)}.html`

async function main() {
  const template = await readFile(join(dist, 'index.html'), 'utf8')
  if (!SEO_BLOCK.test(template))
    throw new Error('index.html: seo markers missing')
  // The SPA fallback must stay a neutral shell (no route-specific head).
  await write('spa.html', template)

  let boot: Bootstrap
  let cards: ProjectCard[]
  try {
    ;[boot, cards] = await Promise.all([
      getJson<Bootstrap>('/bootstrap'),
      getJson<ProjectCard[]>('/projects'),
    ])
  } catch (err) {
    const msg = `prerender: API not reachable at ${api || '(VITE_API_URL unset)'} — ${(err as Error).message}`
    if (strict) throw new Error(msg)
    console.warn(`⚠ ${msg}; shipping the SPA shell only.`)
    await write('robots.txt', 'User-agent: *\nAllow: /\nDisallow: /admin\n')
    return
  }
  const projects = await Promise.all(
    cards.map((c) => getJson<ProjectDetail>(`/projects/${c.slug}`)),
  )

  const { settings } = boot
  const defaultLocale = settings.locales.default
  const enabled = settings.locales.enabled
  const sitemap: { path: string; alternates: Record<Locale, string> }[] = []

  // Resource hints: start the API call, the media connection and the LCP image
  // while the JS bundle is still downloading.
  const apiOrigin = new URL(api).origin
  const mediaUrl =
    boot.about.photo?.url ?? settings.logo?.url ?? cards[0]?.cover.url
  const mediaOrigin = mediaUrl ? new URL(mediaUrl).origin : null
  const preloadImage = (media: Media, sizes: string) => {
    const set = srcSet(media)
    return set
      ? `<link rel="preload" as="image" imagesrcset="${set}" imagesizes="${sizes}" fetchpriority="high" />`
      : `<link rel="preload" as="image" href="${media.url}" fetchpriority="high" />`
  }
  const hints = (extra: string[]) =>
    [
      `<link rel="preconnect" href="${apiOrigin}" crossorigin />`,
      ...(mediaOrigin && mediaOrigin !== apiOrigin
        ? [`<link rel="preconnect" href="${mediaOrigin}" />`]
        : []),
      // Same URL + CORS mode as RTK Query's fetch, so the response is reused.
      `<link rel="preload" as="fetch" href="${api}/public/bootstrap" crossorigin="anonymous" />`,
      ...extra,
    ].join('\n    ')

  // LCP image of the home page = the first section's main image.
  const first = boot.sections[0]
  const homeLcp =
    first === 'about' && boot.about.photo
      ? preloadImage(boot.about.photo, '(min-width: 768px) 40vw, 100vw')
      : first === 'hero' &&
          boot.hero.background.type === 'image' &&
          boot.hero.background.media
        ? preloadImage(boot.hero.background.media, '100vw')
        : null

  const page = (
    locale: Locale,
    path: string,
    input: Parameters<typeof buildSeo>[1],
    body: string,
    head: string,
  ) => {
    const seo = buildSeo(
      { siteUrl, locale, defaultLocale, enabled, settings },
      input,
    )
    // Visually hidden text for crawlers; React replaces #root's content on mount.
    const html = template
      .replace(/<html lang="[^"]*"/, `<html lang="${locale}"`)
      .replace(SEO_BLOCK, `${renderHead(seo)}\n    ${head}`)
      .replace(
        '<div id="root"></div>',
        `<div id="root"><div class="sr-only">${body}</div></div>`,
      )
    const sitePath = pathFor(path, locale, defaultLocale)
    sitemap.push({
      path: sitePath,
      alternates: Object.fromEntries(
        enabled.map((l) => [l, siteUrl + pathFor(path, l, defaultLocale)]),
      ) as Record<Locale, string>,
    })
    return write(fileFor(sitePath), html)
  }

  for (const locale of enabled) {
    const l = (v: Parameters<typeof localize>[0]) =>
      plainText(localize(v, locale, defaultLocale))
    const home = homePage(boot, locale, defaultLocale, siteUrl)
    const links = projects
      .map(
        (p) =>
          `<li><a href="${pathFor(`/work/${p.slug}`, locale, defaultLocale)}">${escapeHtml(l(p.title))}</a></li>`,
      )
      .join('')
    await page(
      locale,
      '/',
      home,
      `<h1>${escapeHtml(home.title)}</h1><p>${escapeHtml(home.description)}</p>` +
        `<h2>${escapeHtml(l(boot.about.heading))}</h2><p>${escapeHtml(excerpt(l(boot.about.bio), 600))}</p>` +
        (links ? `<ul>${links}</ul>` : ''),
      hints(homeLcp ? [homeLcp] : []),
    )

    for (const project of projects) {
      const input = projectPage(
        project,
        settings,
        locale,
        defaultLocale,
        siteUrl,
      )
      await page(
        locale,
        input.path,
        input,
        `<h1>${escapeHtml(l(project.title))}</h1>` +
          `<p>${escapeHtml(project.client)} · ${project.year} · ${escapeHtml(l(project.category))}</p>` +
          `<p>${escapeHtml(l(project.summary))}</p>` +
          `<p>${escapeHtml(excerpt(l(project.challenge), 600))}</p>` +
          `<p>${escapeHtml(excerpt(l(project.solution), 600))}</p>` +
          `<a href="${pathFor('/', locale, defaultLocale)}">${escapeHtml(settings.siteName)}</a>`,
        hints([
          `<link rel="preload" as="fetch" href="${api}/public/projects/${encodeURIComponent(project.slug)}" crossorigin="anonymous" />`,
          preloadImage(project.cover, '100vw'),
        ]),
      )
    }
  }

  const urls = sitemap
    .map(
      ({ path, alternates }) =>
        `  <url>\n    <loc>${siteUrl}${path}</loc>\n` +
        Object.entries(alternates)
          .map(
            ([l, href]) =>
              `    <xhtml:link rel="alternate" hreflang="${l}" href="${href}"/>`,
          )
          .join('\n') +
        `\n  </url>`,
    )
    .join('\n')
  await write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
  )
  await write(
    'robots.txt',
    `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  )
  console.log(
    `✓ prerendered ${sitemap.length} pages (${enabled.join(', ')}) + sitemap.xml, robots.txt`,
  )
}

await main()
