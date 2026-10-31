import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { getToken, setToken } from '../admin/auth'
import type {
  About,
  AdminClient,
  AdminProject,
  AdminService,
  AdminTestimonial,
  ContactMessage,
  Hero,
  MediaItem,
  MediaUsage,
  Paged,
  Settings,
  Stats,
} from '../admin/types'

// Admin-only API (lives in the lazy admin chunk). JWT in localStorage; any 401 logs out.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers) => {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra)
  const url = typeof args === 'string' ? args : args.url
  if (result.error?.status === 401 && url !== 'auth/login') {
    setToken(null)
    window.location.assign('/admin/login')
  }
  return result
}

/** Body shapes the API accepts: media fields are ids. */
type Body = Record<string, unknown>
type Reorder = { id: string; order: number }[]

const CRUD = ['projects', 'clients', 'testimonials', 'services'] as const
type CrudName = (typeof CRUD)[number]
type Tag =
  | 'Settings'
  | 'Hero'
  | 'About'
  | 'Media'
  | 'Messages'
  | 'Stats'
  | 'Me'
  | CrudName

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: [
    'Settings',
    'Hero',
    'About',
    'Media',
    'Messages',
    'Stats',
    'Me',
    ...CRUD,
  ] as Tag[],
  endpoints: (build) => {
    /** list / get / create / update / delete / reorder for one sortable collection. */
    const crud = <T>(name: CrudName) => ({
      list: build.query<T[], void>({
        query: () => `admin/${name}`,
        providesTags: [name],
      }),
      get: build.query<T, string>({
        query: (id) => `admin/${name}/${id}`,
        providesTags: [name],
      }),
      create: build.mutation<T, Body>({
        query: (body) => ({ url: `admin/${name}`, method: 'POST', body }),
        invalidatesTags: [name, 'Stats'],
      }),
      update: build.mutation<T, { id: string; body: Body }>({
        query: ({ id, body }) => ({
          url: `admin/${name}/${id}`,
          method: 'PATCH',
          body,
        }),
        invalidatesTags: [name, 'Stats'],
      }),
      remove: build.mutation<void, string>({
        query: (id) => ({ url: `admin/${name}/${id}`, method: 'DELETE' }),
        invalidatesTags: [name, 'Stats', 'Media'],
      }),
      reorder: build.mutation<T[], Reorder>({
        query: (body) => ({
          url: `admin/${name}/reorder`,
          method: 'PATCH',
          body,
        }),
        invalidatesTags: [name],
      }),
    })

    const projects = crud<AdminProject>('projects')
    const clients = crud<AdminClient>('clients')
    const testimonials = crud<AdminTestimonial>('testimonials')
    const services = crud<AdminService>('services')

    return {
      login: build.mutation<
        { accessToken: string },
        { email: string; password: string }
      >({
        query: (body) => ({ url: 'auth/login', method: 'POST', body }),
      }),
      me: build.query<
        { id: string; email: string; lastLoginAt?: string },
        void
      >({
        query: () => 'auth/me',
        providesTags: ['Me'],
      }),
      changePassword: build.mutation<
        { accessToken: string },
        { currentPassword: string; newPassword: string }
      >({
        query: (body) => ({ url: 'auth/password', method: 'PATCH', body }),
      }),

      stats: build.query<Stats, void>({
        query: () => 'admin/stats',
        providesTags: ['Stats'],
      }),

      getSettings: build.query<Settings, void>({
        query: () => 'admin/settings',
        providesTags: ['Settings'],
      }),
      updateSettings: build.mutation<Settings, Body>({
        query: (body) => ({ url: 'admin/settings', method: 'PATCH', body }),
        invalidatesTags: ['Settings', 'Media'],
      }),
      getHero: build.query<Hero, void>({
        query: () => 'admin/hero',
        providesTags: ['Hero'],
      }),
      updateHero: build.mutation<Hero, Body>({
        query: (body) => ({ url: 'admin/hero', method: 'PUT', body }),
        invalidatesTags: ['Hero', 'Media'],
      }),
      getAbout: build.query<About, void>({
        query: () => 'admin/about',
        providesTags: ['About'],
      }),
      updateAbout: build.mutation<About, Body>({
        query: (body) => ({ url: 'admin/about', method: 'PUT', body }),
        invalidatesTags: ['About', 'Media'],
      }),

      listProjects: projects.list,
      getProject: projects.get,
      createProject: projects.create,
      updateProject: projects.update,
      deleteProject: projects.remove,
      reorderProjects: projects.reorder,
      listClients: clients.list,
      createClient: clients.create,
      updateClient: clients.update,
      deleteClient: clients.remove,
      reorderClients: clients.reorder,
      listTestimonials: testimonials.list,
      createTestimonial: testimonials.create,
      updateTestimonial: testimonials.update,
      deleteTestimonial: testimonials.remove,
      reorderTestimonials: testimonials.reorder,
      listServices: services.list,
      createService: services.create,
      updateService: services.update,
      deleteService: services.remove,
      reorderServices: services.reorder,

      listMedia: build.query<
        Paged<MediaItem>,
        { type?: string; page?: number; limit?: number }
      >({
        query: (params) => ({ url: 'admin/media', params }),
        providesTags: ['Media'],
      }),
      uploadMedia: build.mutation<MediaItem[], File[]>({
        query: (files) => {
          const body = new FormData()
          files.forEach((f) => body.append('files', f))
          return { url: 'admin/media', method: 'POST', body }
        },
        invalidatesTags: ['Media', 'Stats'],
      }),
      updateMedia: build.mutation<MediaItem, { id: string; alt: Body }>({
        query: ({ id, alt }) => ({
          url: `admin/media/${id}`,
          method: 'PATCH',
          body: { alt },
        }),
        invalidatesTags: ['Media'],
      }),
      deleteMedia: build.mutation<void, string>({
        query: (id) => ({ url: `admin/media/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Media', 'Stats'],
      }),
      mediaUsage: build.query<MediaUsage[], string>({
        query: (id) => `admin/media/${id}/usage`,
      }),

      listMessages: build.query<
        Paged<ContactMessage>,
        { read?: boolean; page?: number }
      >({
        query: (params) => ({ url: 'admin/messages', params }),
        providesTags: ['Messages'],
      }),
      updateMessage: build.mutation<
        ContactMessage,
        { id: string; read: boolean }
      >({
        query: ({ id, read }) => ({
          url: `admin/messages/${id}`,
          method: 'PATCH',
          body: { read },
        }),
        invalidatesTags: ['Messages', 'Stats'],
      }),
      deleteMessage: build.mutation<void, string>({
        query: (id) => ({ url: `admin/messages/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Messages', 'Stats'],
      }),
    }
  },
})

export const {
  useLoginMutation,
  useMeQuery,
  useChangePasswordMutation,
  useStatsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetHeroQuery,
  useUpdateHeroMutation,
  useGetAboutQuery,
  useUpdateAboutMutation,
  useListProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useReorderProjectsMutation,
  useListClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useReorderClientsMutation,
  useListTestimonialsQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
  useReorderTestimonialsMutation,
  useListServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useReorderServicesMutation,
  useListMediaQuery,
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
  useMediaUsageQuery,
  useLazyMediaUsageQuery,
  useListMessagesQuery,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
} = adminApi
