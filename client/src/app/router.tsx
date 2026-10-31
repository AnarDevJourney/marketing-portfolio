import { createBrowserRouter, type RouteObject } from 'react-router'
import { SiteLayout } from '../components/layout/SiteLayout'
import HomePage from '../pages/site/HomePage'
import NotFoundPage from '../pages/site/NotFoundPage'

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'dev/design',
        lazy: async () => ({
          Component: (await import('../pages/dev/DesignPage')).default,
        }),
      },
    ]
  : []

export const router = createBrowserRouter([
  // Admin lives in its own lazy chunk; nothing from it (or antd) reaches the public bundle.
  {
    path: '/admin/*',
    lazy: async () => ({
      Component: (await import('../pages/admin/AdminApp')).default,
    }),
  },
  {
    path: '/:lang?',
    Component: SiteLayout,
    children: [
      { index: true, Component: HomePage },
      {
        path: 'work/:slug',
        lazy: async () => ({
          Component: (await import('../pages/site/ProjectPage')).default,
        }),
      },
      ...devRoutes,
      { path: '*', Component: NotFoundPage },
    ],
  },
])
