import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { APP_URL } from '../lib/config'
import { getLegalPaths } from '../legal/registry'
import { Logo } from './Logo'

export function Footer() {
  const { t, locale } = useI18n()
  const year = new Date().getFullYear()
  const appHost = APP_URL.replace('https://', '')
  const paths = getLegalPaths(locale)

  const legalLinks = [
    { href: paths.legal, label: t.footer.links.legal },
    { href: paths.privacy, label: t.footer.links.privacy },
    { href: paths.cookies, label: t.footer.links.cookies },
    { href: paths.terms, label: t.footer.links.terms },
    { href: paths.schools, label: t.footer.links.schools },
    { href: 'mailto:hola@petitdiari.com', label: t.footer.links.contact, external: true },
  ] as const

  return (
    <footer className="border-t border-stone-200/60 bg-white/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <Link to="/">
              <Logo size="lg" />
            </Link>
            <p className="text-xs text-stone-400 font-medium mt-2 ml-14">{t.footer.tagline}</p>
          </div>

          <a
            href={APP_URL}
            className="text-sm font-bold text-pd-teal hover:text-pd-teal-dark transition-colors"
          >
            {appHost} →
          </a>
        </div>

        <nav className="mt-8 flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 text-xs font-medium text-stone-500">
          {legalLinks.map(({ href, label, ...rest }) =>
            'external' in rest ? (
              <a key={href} href={href} className="hover:text-pd-teal transition-colors">
                {label}
              </a>
            ) : (
              <Link key={href} to={href} className="hover:text-pd-teal transition-colors">
                {label}
              </Link>
            )
          )}
        </nav>

        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400 font-medium">
          <p>© {year} Petit Diari. {t.footer.rights}</p>
          <p>{t.footer.madeIn} 💛</p>
        </div>
      </div>
    </footer>
  )
}
