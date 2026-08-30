import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useI18n, localeLabels, type Locale } from '../i18n'

const APP_URL = 'https://app.petitdiari.com'

const navLinks = [
  { key: 'features' as const, href: '#funcionalitats' },
  { key: 'gallery' as const, href: '#galeria' },
  { key: 'pricing' as const, href: '#preus' },
  { key: 'faq' as const, href: '#faq' },
  { key: 'contact' as const, href: '#contacte' },
]

export function Header() {
  const { t, locale, setLocale } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-pd-cream/90 backdrop-blur-md shadow-sm border-b border-stone-200/60' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-pd-teal flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <rect x="4" y="3" width="12" height="18" rx="2" opacity="0.9" />
              <rect x="6" y="7" width="8" height="1" rx="0.5" fill="#0f766e" opacity="0.5" />
              <rect x="6" y="10" width="6" height="1" rx="0.5" fill="#0f766e" opacity="0.3" />
              <circle cx="18" cy="17" r="3" fill="#fbbf24" />
            </svg>
          </div>
          <span className="font-display font-black text-lg text-stone-800 tracking-tight">
            Petit <span className="text-pd-teal">Diari</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              className="px-3 py-2 text-sm font-semibold text-stone-600 hover:text-pd-teal rounded-lg hover:bg-pd-teal/5 transition-colors"
            >
              {t.nav[key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-stone-200 bg-white p-0.5 shadow-xs">
            {(['ca', 'es', 'en'] as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  locale === loc
                    ? 'bg-pd-teal text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {localeLabels[loc]}
              </button>
            ))}
          </div>

          <a
            href={APP_URL}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-pd-teal hover:bg-pd-teal-dark rounded-xl shadow-sm transition-colors"
          >
            {t.nav.enterApp}
          </a>

          <button
            type="button"
            className="lg:hidden p-2 rounded-xl border border-stone-200 bg-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-pd-cream/95 backdrop-blur-md px-4 py-4 space-y-1">
          {navLinks.map(({ key, href }) => (
            <a
              key={key}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-stone-700 rounded-xl hover:bg-white"
            >
              {t.nav[key]}
            </a>
          ))}
          <a
            href={APP_URL}
            className="block mt-2 text-center px-4 py-3 text-sm font-bold text-white bg-pd-teal rounded-xl"
          >
            {t.nav.enterApp}
          </a>
        </div>
      )}
    </header>
  )
}
