import type {
  About,
  Client,
  Hero,
  LocalizedString,
  Media,
  Metric,
  ProjectDetail,
  Service,
  Settings,
  Testimonial,
} from '../api/types'

/** Admin responses include unpublished items plus ordering metadata. */
export interface Orderable {
  _id: string
  order: number
  published: boolean
}

export type AdminProject = Omit<ProjectDetail, 'next'> & Orderable
export type AdminClient = Client & Orderable
export type AdminTestimonial = Testimonial & Orderable
export type AdminService = Service & Orderable

export interface MediaItem extends Media {
  key: string
  size: number
  createdAt: string
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface ContactMessage {
  _id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  locale: 'az' | 'en' | 'ru'
  read: boolean
  createdAt: string
}

export interface Stats {
  unreadMessages: number
  projects: { total: number; published: number }
  media: { count: number; totalSize: number }
}

export interface MediaUsage {
  collection: string
  id: string
  field: string
}

export type { About, Hero, LocalizedString, Media, Metric, Settings }
