import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '../components/Logo'
import type { LegalDoc } from '../legal/registry'
import { getLegalPaths } from '../legal/registry'
import type { Locale } from '../i18n/types'

type LegalLayoutProps = {
  doc: LegalDoc
  children: React.ReactNode
  uiLocale: Locale
}

export function LegalLayout({ doc, children, uiLocale }: LegalLayoutProps) {
  const paths = getLegalPaths(uiLocale === 'es' ? 'es' : 'ca')

  const alternateHref =
    doc.slug === 'cookies'
      ? doc.locale === 'ca'
        ? '/legal/cookies?lang=es'
        : '/legal/cookies'
      : `/legal/${doc.alternateSlug}`

  return (
    <div className="min-h-screen bg-pd-cream flex flex-col">
      <header className="border-b border-stone-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-3 text-xs font-bold">
            {doc.locale === 'ca' ? (
              <Link to={alternateHref} className="text-stone-400 hover:text-pd-teal transition-colors">
                Castellano
              </Link>
            ) : (
              <Link to={alternateHref} className="text-stone-400 hover:text-pd-teal transition-colors">
                Català
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-pd-teal transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {doc.locale === 'es' ? 'Volver al inicio' : "Tornar a l'inici"}
          </Link>

          <article className="legal-prose">{children}</article>
        </div>
      </main>

      <footer className="border-t border-stone-200/60 bg-white/60 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium text-stone-400">
          <Link to={paths.legal} className="hover:text-pd-teal transition-colors">
            {doc.locale === 'es' ? 'Aviso legal' : 'Avís legal'}
          </Link>
          <Link to={paths.privacy} className="hover:text-pd-teal transition-colors">
            {doc.locale === 'es' ? 'Privacidad' : 'Privacitat'}
          </Link>
          <Link to={paths.cookies} className="hover:text-pd-teal transition-colors">
            Cookies
          </Link>
          <Link to={paths.terms} className="hover:text-pd-teal transition-colors">
            {doc.locale === 'es' ? 'Términos' : 'Termes'}
          </Link>
          <Link to={paths.schools} className="hover:text-pd-teal transition-colors">
            {doc.locale === 'es' ? 'Para escuelas' : 'Per a escoles'}
          </Link>
          <a href="mailto:hola@petitdiari.com" className="hover:text-pd-teal transition-colors">
            hola@petitdiari.com
          </a>
        </div>
        <p className="text-center text-[10px] text-stone-400 mt-4 font-medium">
          © {new Date().getFullYear()} Petit Diari
        </p>
      </footer>
    </div>
  )
}
