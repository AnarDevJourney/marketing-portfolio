// Shapes of the public API responses (see server/src/modules/*).

export const LOCALES = ['az', 'en', 'ru'] as const
export type Locale = (typeof LOCALES)[number]

export type LocalizedString = Record<Locale, string>

export interface Media {
  _id: string
  url: string
  type: 'image' | 'video' | 'file'
  mimeType: string
  width?: number
  height?: number
  duration?: number
  variants?: { w480?: string; w1024?: string; w1920?: string }
  blurDataUrl?: string
  alt: LocalizedString
}

export interface Metric {
  value: number
  prefix?: string
  suffix?: string
  label: LocalizedString
}

export type ColorKey = 'primary' | 'accent' | 'background' | 'surface' | 'text'
export type HeadingFont = 'unbounded' | 'geologica' | 'playfair-display'
export type BodyFont = 'onest' | 'inter' | 'commissioner'
export type SectionKey =
  | 'hero'
  | 'clients'
  | 'about'
  | 'services'
  | 'work'
  | 'testimonials'
  | 'contact'
export type SocialPlatform =
  'instagram' | 'linkedin' | 'behance' | 'tiktok' | 'x' | 'youtube'

export interface FontChoice {
  heading: HeadingFont
  body: BodyFont
}

export interface Settings {
  siteName: string
  logo: Media | null
  logoDark: Media | null
  favicon: Media | null
  colors: Record<ColorKey, string>
  font: FontChoice
  socials: { platform: SocialPlatform; url: string }[]
  contact: { email: string; phone?: string; location: LocalizedString }
  sections: { key: SectionKey; enabled: boolean; order: number }[]
  seo: {
    title: LocalizedString
    description: LocalizedString
    ogImage?: Media | null
  }
  locales: { default: Locale; enabled: Locale[] }
  features: { customCursor: boolean; preloader: boolean; smoothScroll: boolean }
  /** Work section split into two tabs (projects pick one via `group`). */
  workGroups: {
    enabled: boolean
    primary: LocalizedString
    secondary: LocalizedString
  }
}

export interface Hero {
  eyebrow?: LocalizedString
  title: LocalizedString
  subtitle: LocalizedString
  cta: { label: LocalizedString; href: string }
  background: {
    type: 'image' | 'video' | 'none'
    media: Media | null
    poster: Media | null
    overlayOpacity: number
  }
}

export interface TimelineEntry {
  period: string
  title: LocalizedString
  company: string
  description?: LocalizedString
}

export interface About {
  photo: Media | null
  heading: LocalizedString
  bio: LocalizedString
  stats: Metric[]
  timeline: TimelineEntry[]
  /** Same shape as timeline: title = degree, company = school. */
  education: TimelineEntry[]
  /** Show/hide the experience + education block. */
  careerVisible: boolean
  cv: Media | null
}

export interface Bootstrap {
  settings: Settings
  hero: Hero
  about: About
  sections: SectionKey[]
}

export type ProjectGroup = 'primary' | 'secondary'
export const PROJECT_GROUPS: ProjectGroup[] = ['primary', 'secondary']

export interface ProjectCard {
  _id: string
  slug: string
  title: LocalizedString
  client: string
  category: LocalizedString
  year: number
  summary: LocalizedString
  cover: Media
  coverVideo: Media | null
  tags: string[]
  featured: boolean
  group: ProjectGroup
}

export interface ProjectDetail extends ProjectCard {
  challenge: LocalizedString
  solution: LocalizedString
  results: Metric[]
  gallery: Media[]
  seo?: { title?: LocalizedString; description?: LocalizedString }
  next: ProjectCard | null
}

export interface Client {
  _id: string
  name: string
  logo: Media
  website?: string
}

export interface Testimonial {
  _id: string
  author: string
  role: LocalizedString
  company?: string
  quote: LocalizedString
  avatar: Media | null
}

export interface Service {
  _id: string
  title: LocalizedString
  description: LocalizedString
  icon: string
}

export interface ContactPayload {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  locale: Locale
  website?: string
  startedAt: number
}
