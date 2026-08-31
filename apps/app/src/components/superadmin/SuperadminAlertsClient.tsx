'use client'

import Link from 'next/link'
import type { OperationalAlert } from '@/lib/superadmin-onboarding'
import { SaPanel, SaPanelHeader } from './sa-ui'

export function SuperadminAlertsClient({ alerts }: { alerts: OperationalAlert[] }) {
  const critical = alerts.filter((a) => a.severity === 'critical')
  const warning = alerts.filter((a) => a.severity === 'warning')
  const info = alerts.filter((a) => a.severity === 'info')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <CountBox label="Crítiques" count={critical.length} color="red" />
        <CountBox label="Advertències" count={warning.length} color="amber" />
        <CountBox label="Informació" count={info.length} color="stone" />
      </div>

      {alerts.length === 0 ? (
        <SaPanel>
          <div className="p-8 text-center text-stone-500 text-sm">Cap alerta operativa. Tot en ordre.</div>
        </SaPanel>
      ) : (
        <SaPanel>
          <SaPanelHeader title="Alertes per centre" />
          <ul className="divide-y divide-stone-800">
            {alerts.map((alert) => (
              <li key={alert.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <SeverityDot severity={alert.severity} />
                    <span className="font-bold text-stone-200 text-sm">{alert.title}</span>
                    <span className="text-xs text-stone-500">· {alert.schoolName}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 ml-4">{alert.detail}</p>
                </div>
                <Link
                  href={`/superadmin/escoles/${alert.schoolId}`}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 shrink-0"
                >
                  Gestionar centre →
                </Link>
              </li>
            ))}
          </ul>
        </SaPanel>
      )}
    </div>
  )
}

function CountBox({ label, count, color }: { label: string; count: number; color: 'red' | 'amber' | 'stone' }) {
  const bg = { red: 'text-red-400', amber: 'text-amber-400', stone: 'text-stone-300' }
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-lg p-4">
      <div className="text-[11px] uppercase font-bold text-stone-500">{label}</div>
      <div className={`text-2xl font-black mt-1 ${bg[color]}`}>{count}</div>
    </div>
  )
}

function SeverityDot({ severity }: { severity: OperationalAlert['severity'] }) {
  const colors = { critical: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-stone-500' }
  return <span className={`h-2 w-2 rounded-full shrink-0 ${colors[severity]}`} />
}
