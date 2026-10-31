import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  Bootstrap,
  Client,
  ContactPayload,
  ProjectCard,
  ProjectDetail,
  Service,
  Testimonial,
} from './types'

export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/public`,
  }),
  endpoints: (build) => ({
    getBootstrap: build.query<Bootstrap, void>({ query: () => 'bootstrap' }),
    getProjects: build.query<ProjectCard[], { featured?: boolean } | void>({
      query: (args) => ({
        url: 'projects',
        params: args?.featured ? { featured: true } : undefined,
      }),
    }),
    getProject: build.query<ProjectDetail, string>({
      query: (slug) => `projects/${encodeURIComponent(slug)}`,
    }),
    getServices: build.query<Service[], void>({ query: () => 'services' }),
    getClients: build.query<Client[], void>({ query: () => 'clients' }),
    getTestimonials: build.query<Testimonial[], void>({
      query: () => 'testimonials',
    }),
    sendContact: build.mutation<{ ok: true }, ContactPayload>({
      query: (body) => ({ url: 'contact', method: 'POST', body }),
    }),
  }),
})

export const {
  useGetBootstrapQuery,
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetServicesQuery,
  useGetClientsQuery,
  useGetTestimonialsQuery,
  useSendContactMutation,
} = publicApi
