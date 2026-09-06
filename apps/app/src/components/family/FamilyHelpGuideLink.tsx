'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

/** Enllaç discret cap a la guia d'instal·lació / notificacions. */
export function FamilyHelpGuideLink({ className = '' }: { className?: string }) {
  const t = useTranslations('familyHelp')

  return (
    <p className={`text-center text-[11px] text-stone-400 leading-relaxed ${className}`}>
      <span aria-hidden>💡 </span>
      <Link
        href="/mi-hijo/ayuda"
        className="italic text-stone-500 hover:text-teal-700 underline-offset-2 hover:underline"
      >
        {t('guideLink')}
      </Link>
    </p>
  )
}
