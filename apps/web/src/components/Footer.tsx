import { useI18n } from '../i18n'
import { APP_URL } from '../lib/config'
import { Logo } from './Logo'

export function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()
  const appHost = APP_URL.replace('https://', '')

  return (
    <footer className="border-t border-stone-200/60 bg-white/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <Logo size="lg" />
            <p className="text-xs text-stone-400 font-medium mt-2 ml-14">{t.footer.tagline}</p>
          </div>

          <a
            href={APP_URL}
            className="text-sm font-bold text-pd-teal hover:text-pd-teal-dark transition-colors"
          >
            {appHost} →
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400 font-medium">
          <p>© {year} Petit Diari. {t.footer.rights}</p>
          <p>{t.footer.madeIn} 💛</p>
        </div>
      </div>
    </footer>
  )
}
