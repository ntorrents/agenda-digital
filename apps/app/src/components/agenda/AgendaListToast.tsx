'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, FilePenLine, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function AgendaListToast() {
  const t = useTranslations('dashboardAgendas')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const draftSaved = searchParams.get('draftSaved')
  const sent = searchParams.get('sent')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!draftSaved && !sent) {
      setVisible(false)
      return
    }
    setVisible(true)
    const timer = window.setTimeout(() => setVisible(false), 5000)
    return () => window.clearTimeout(timer)
  }, [draftSaved, sent])

  const dismiss = () => {
    setVisible(false)
    const next = new URLSearchParams(searchParams.toString())
    next.delete('draftSaved')
    next.delete('sent')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  if (!visible || (!draftSaved && !sent)) return null

  const isDraft = !!draftSaved
  const name = draftSaved || sent || ''

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm animate-in slide-in-from-top-2 ${
        isDraft
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}
      role="status"
    >
      {isDraft ? (
        <FilePenLine className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
      ) : (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
      )}
      <p className="text-sm font-bold flex-1 leading-snug">
        {isDraft ? t('draftSavedMsg', { name }) : t('sentMsg', { name })}
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="text-stone-400 hover:text-stone-600 p-0.5"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
