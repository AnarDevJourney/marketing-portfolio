import { LazyMotion } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router'
import { router } from './app/router'
import { store } from './app/store'
import './i18n'
import './index.css'
import { readThemeCache } from './theme/applyTheme'
import { DEFAULT_FONTS, loadFonts } from './theme/fonts'

// Start loading fonts right away (cached choice from the last visit, or defaults).
loadFonts(readThemeCache()?.font ?? DEFAULT_FONTS)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* `m` components + async features keep Motion's engine out of the initial bundle */}
    <LazyMotion
      features={() =>
        import('./lib/motion-features').then((mod) => mod.default)
      }
      strict
    >
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </LazyMotion>
  </StrictMode>,
)
