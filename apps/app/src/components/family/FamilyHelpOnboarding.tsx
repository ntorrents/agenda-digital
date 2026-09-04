'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, CheckCircle2, Circle, Download, Smartphone } from 'lucide-react'
import { canUseWebPush, isStandaloneDisplay } from '@/lib/pwa/detect'

export function FamilyHelpOnboarding() {
  const [installed, setInstalled] = useState(false)
  const [notificationsOn, setNotificationsOn] = useState(false)

  useEffect(() => {
    setInstalled(isStandaloneDisplay())
    if (canUseWebPush()) {
      setNotificationsOn(Notification.permission === 'granted')
    }
  }, [])

  return (
    <div className="bg-gradient-to-br from-teal-50 via-white to-sky-50 border border-teal-100 rounded-[28px] p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-teal-600" />
          Recomanacions per utilitzar l&apos;app
        </h3>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
          Dos passos senzills per rebre l&apos;agenda i els avisos al moment.
        </p>
      </div>

      <div className="space-y-3">
        <OnboardingStep
          done={installed}
          icon={<Download className="h-4 w-4" />}
          title="Pas 1: Instal·la l'aplicació al teu mòbil"
          body="A iPhone (Safari): Compartir → «Afegeix a la pantalla d'inici». A Android: accepta l'avís d'instal·lació o el menú del navegador → «Instal·lar app»."
          accent="teal"
        />
        <OnboardingStep
          done={notificationsOn}
          icon={<Bell className="h-4 w-4" />}
          title="Pas 2: Activa les notificacions"
          body="Ves a Perfil i activa les notificacions per rebre avisos de l'agenda, el menjador i el centre a l'instant."
          accent="sky"
          cta={
            <Link
              href="/mi-hijo/perfil"
              className="inline-flex text-[11px] font-bold text-sky-700 hover:text-sky-900 underline underline-offset-2"
            >
              Anar al Perfil
            </Link>
          }
        />
      </div>
    </div>
  )
}

function OnboardingStep({
  done,
  icon,
  title,
  body,
  accent,
  cta,
}: {
  done: boolean
  icon: React.ReactNode
  title: string
  body: string
  accent: 'teal' | 'sky'
  cta?: React.ReactNode
}) {
  const iconBg = accent === 'teal' ? 'bg-teal-100 text-teal-700' : 'bg-sky-100 text-sky-700'

  return (
    <div
      className={`rounded-2xl border p-4 flex gap-3 ${
        done ? 'border-emerald-200 bg-emerald-50/50' : 'border-white/80 bg-white/80'
      }`}
    >
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-black text-stone-800 leading-snug">{title}</p>
          {done ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" /> Fet
            </span>
          ) : (
            <Circle className="h-3.5 w-3.5 text-stone-300 shrink-0 mt-0.5" />
          )}
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">{body}</p>
        {cta}
      </div>
    </div>
  )
}
