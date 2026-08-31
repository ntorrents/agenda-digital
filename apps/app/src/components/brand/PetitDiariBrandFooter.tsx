'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { getLegalUrls } from '@/lib/legal-urls'

export const PETIT_DIARI_WEB_URL = 'https://petitdiari.com'

/** Peu de pàgina discret amb enllaç a la web de marca. */
export function PetitDiariBrandFooter({ className }: { className?: string }) {
  const locale = useLocale()
  const t = useTranslations('legal')
  const urls = getLegalUrls(locale)

  return (
    <footer
      className={cn(
        'flex flex-col items-center gap-1.5 py-4 text-center text-[10px] font-medium text-stone-400',
        className
      )}
    >
      <Link
        href={PETIT_DIARI_WEB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-stone-500 hover:text-[#0f766e] transition-colors"
      >
        <img
          src="/logo-petit-diari.svg"
          alt=""
          aria-hidden
          className="h-3.5 w-auto opacity-70"
        />
        <span className="font-bold tracking-tight">petitdiari.com</span>
      </Link>
      <span className="text-stone-400/90">{t('brandTagline')}</span>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10px]">
        <a
          href={urls.privacy}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-400 hover:text-[#0f766e] transition-colors"
        >
          {t('privacy')}
        </a>
        <span className="text-stone-300" aria-hidden>
          ·
        </span>
        <a
          href={urls.terms}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-400 hover:text-[#0f766e] transition-colors"
        >
          {t('terms')}
        </a>
        <span className="text-stone-300" aria-hidden>
          ·
        </span>
        <a
          href={urls.cookies}
          target="_blank"
          rel="noopener noreferrer"
          className="text-stone-400 hover:text-[#0f766e] transition-colors"
        >
          {t('cookies')}
        </a>
      </div>
    </footer>
  )
}

/** Versió inline per barres laterals (encara més compacta). */
export function PetitDiariBrandMark({ className }: { className?: string }) {
  return (
    <Link
      href={PETIT_DIARI_WEB_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-bold text-stone-400 hover:text-[#0f766e] transition-colors',
        className
      )}
    >
      <img src="/logo-petit-diari.svg" alt="" aria-hidden className="h-3 w-auto opacity-60" />
      petitdiari.com
    </Link>
  )
}
