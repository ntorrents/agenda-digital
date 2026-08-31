'use client'

import Link from 'next/link'
import type { OnboardingStep } from '@/lib/superadmin-onboarding'

export function OnboardingPanel({
  schoolId,
  schoolName,
  steps,
  progress,
  ready,
  compact,
}: {
  schoolId?: string
  schoolName?: string
  steps: OnboardingStep[]
  progress: number
  ready: boolean
  compact?: boolean
}) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {!compact && (
        <div className="flex items-center justify-between gap-2">
          <div>
            {schoolName && <h4 className="text-sm font-bold text-stone-200">{schoolName}</h4>}
            <p className="text-[11px] text-stone-500">
              {ready ? 'Centre operatiu' : 'Pendent d\'activació completa'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-violet-400">{progress}%</div>
            {schoolId && (
              <Link href={`/superadmin/escoles/${schoolId}`} className="text-[10px] text-violet-400 hover:underline">
                Gestionar
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div className="h-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <ul className={compact ? 'space-y-1' : 'space-y-1.5'}>
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-2 text-xs">
            <span
              className={`mt-0.5 h-3.5 w-3.5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black ${
                step.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-600'
              }`}
            >
              {step.done ? '✓' : ''}
            </span>
            <span className={step.done ? 'text-stone-400' : 'text-stone-300'}>
              {step.label}
              {step.detail && <span className="text-stone-600 ml-1">· {step.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
