import { useTranslation } from 'react-i18next'
import type { Settings } from '../../api/types'
import { scrollToTarget } from '../../lib/lenis'
import { Container } from '../ui/Container'

const YEAR = new Date().getFullYear()

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  behance: 'Behance',
  tiktok: 'TikTok',
  x: 'X',
  youtube: 'YouTube',
}

/** Skeleton footer; the full version (huge name, animations) comes in Phase 4. */
export function Footer({ settings }: { settings: Settings }) {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-fg/10 pt-section pb-gutter">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-10">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {settings.socials.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  {SOCIAL_LABELS[s.platform]}
                </a>
              </li>
            ))}
          </ul>
          <button
            onClick={() => scrollToTarget(0)}
            className="text-label text-fg/60 hover:text-fg"
          >
            {t('common.backToTop')} ↑
          </button>
        </div>
        <p className="mt-16 font-heading text-[clamp(3rem,15vw,16rem)] leading-[0.85] tracking-[-0.05em] break-words">
          {settings.siteName}
        </p>
        <div className="mt-8 flex flex-wrap justify-between gap-4 text-xs text-fg/60">
          <span>
            © {YEAR} {settings.siteName}. {t('footer.rights')}
          </span>
          <span>{t('footer.madeWith')}</span>
        </div>
      </Container>
    </footer>
  )
}
