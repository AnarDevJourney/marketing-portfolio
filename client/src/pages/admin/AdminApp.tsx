import { App as AntApp, ConfigProvider } from 'antd'
import azAZ from 'antd/locale/az_AZ'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router'
import { adminStore } from '../../admin/store'
import { AdminLayout, RequireAuth } from './AdminLayout'
import AboutPage from './AboutPage'
import AccountPage from './AccountPage'
import { ClientsPage, ServicesPage, TestimonialsPage } from './CollectionPages'
import DashboardPage from './DashboardPage'
import HeroPage from './HeroPage'
import LoginPage from './LoginPage'
import MediaPage from './MediaPage'
import MessagesPage from './MessagesPage'
import ProjectFormPage from './ProjectFormPage'
import ProjectsPage from './ProjectsPage'
import SectionsPage from './SectionsPage'
import SettingsPage from './SettingsPage'

/** Admin panel entry (lazy chunk, own store, Ant Design). Nothing here reaches the public bundle. */
export default function AdminApp() {
  // The public site's dark theme + film grain must not leak into the admin.
  useEffect(() => {
    const { body, documentElement: html } = document
    body.classList.remove('grain')
    html.style.colorScheme = 'light'
    html.style.backgroundColor = '#f5f5f5'
    const title = document.title
    document.title = 'Admin panel'
    return () => {
      body.classList.add('grain')
      html.style.colorScheme = ''
      html.style.backgroundColor = ''
      document.title = title
    }
  }, [])

  return (
    <Provider store={adminStore}>
      <ConfigProvider
        locale={azAZ}
        theme={{
          token: {
            colorPrimary: '#ff5b2e',
            borderRadius: 8,
            fontFamily:
              "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          },
        }}
      >
        <AntApp>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="hero" element={<HeroPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/new" element={<ProjectFormPage />} />
              <Route path="projects/:id" element={<ProjectFormPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="testimonials" element={<TestimonialsPage />} />
              <Route path="sections" element={<SectionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="media" element={<MediaPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="account" element={<AccountPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AntApp>
      </ConfigProvider>
    </Provider>
  )
}
