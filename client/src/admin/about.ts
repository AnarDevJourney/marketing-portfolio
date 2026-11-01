import type { About, TimelineEntry } from '../api/types'
import { toId } from './utils'

/** Drops empty optional descriptions so the API doesn't store blank strings. */
const cleanTimeline = (items: TimelineEntry[] | undefined) =>
  (items ?? []).map((t) => ({
    ...t,
    description:
      t.description && Object.values(t.description).some(Boolean)
        ? t.description
        : undefined,
  }))

/**
 * PUT /admin/about replaces the whole document, but it is edited on two admin pages
 * (Haqqımda; Təcrübə və təhsil). Each page merges its form values over the loaded
 * data and sends the full body — only whitelisted fields (the API forbids extras).
 */
export const aboutBody = (a: About) => ({
  heading: a.heading,
  bio: a.bio,
  photo: toId(a.photo),
  cv: toId(a.cv),
  stats: a.stats ?? [],
  timeline: cleanTimeline(a.timeline),
  education: cleanTimeline(a.education),
  careerVisible: a.careerVisible ?? true,
})
