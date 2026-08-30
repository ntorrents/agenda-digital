import { useI18n } from '../i18n'

const APP_URL = 'https://app.petdiari.com'

export function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-stone-200/60 bg-white/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pd-teal flex items-center justify-center">
              <span className="text-white text-lg">📖</span>
            </div>
            <div>
              <p className="font-display font-black text-stone-800">Petit Diari</p>
              <p className="text-xs text-stone-400 font-medium">{t.footer.tagline}</p>
            </div>
          </div>

          <a
            href={APP_URL}
            className="text-sm font-bold text-pd-teal hover:text-pd-teal-dark transition-colors"
          >
            app.petitdiari.com →
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
