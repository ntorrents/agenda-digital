'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { exportFinancesCsv, generateMonthlyInvoicesDraft } from '@/app/superadmin/erp-actions'
import { INVOICE_STATUS_LABELS } from '@/lib/superadmin-commercial'
import { SaButton, SaInput, SaPanel, SaPanelHeader, SaTable } from './sa-ui'

type InvoiceRow = {
  id: string
  school_id: string
  school_name: string
  period_start: string
  period_end: string
  amount: number
  status: string
  due_date: string | null
  paid_at: string | null
  reference: string | null
}

export function SuperadminFinancesClient({
  invoices,
  summary,
  erpTablesMissing,
}: {
  invoices: InvoiceRow[]
  summary: {
    totalMrr: number
    pendingAmount: number
    overdueCount: number
    paidThisMonth: number
  }
  erpTablesMissing: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [message, setMessage] = useState<string | null>(null)

  const handleExport = () => {
    startTransition(async () => {
      const r = await exportFinancesCsv()
      if (!r.csv) {
        setMessage('Error exportant CSV')
        return
      }
      const blob = new Blob([r.csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = r.filename
      a.click()
      URL.revokeObjectURL(url)
      setMessage('CSV descarregat')
    })
  }

  const handleBatch = () => {
    if (!confirm(`Generar esborranys de factura per ${month} per a tots els centres actius?`)) return
    startTransition(async () => {
      const r = await generateMonthlyInvoicesDraft(month)
      if (r.error) setMessage(r.error)
      else setMessage(`${r.created} factura(s) creada(s)`)
    })
  }

  return (
    <div className="space-y-4">
      {erpTablesMissing && (
        <div className="p-3 bg-amber-950/30 border border-amber-800 rounded text-sm text-amber-200">
          Executa <code>superadmin-erp.sql</code> a Supabase per habilitar factures.
        </div>
      )}

      {message && <p className="text-sm text-stone-400">{message}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="MRR actiu" value={`${summary.totalMrr} €`} />
        <Kpi label="Pendent cobrar" value={`${summary.pendingAmount.toFixed(2)} €`} />
        <Kpi label="Factures vençudes" value={String(summary.overdueCount)} />
        <Kpi label="Cobrat aquest mes" value={`${summary.paidThisMonth.toFixed(2)} €`} />
      </div>

      <SaPanel>
        <SaPanelHeader
          title="Accions globals"
          action={
            <div className="flex flex-wrap gap-2">
              <SaButton type="button" variant="secondary" disabled={pending} onClick={handleExport}>
                Exportar CSV centres
              </SaButton>
              <SaInput
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-auto"
              />
              <SaButton type="button" disabled={pending || erpTablesMissing} onClick={handleBatch}>
                Generar factures del mes
              </SaButton>
            </div>
          }
        />
      </SaPanel>

      <SaPanel>
        <SaPanelHeader title="Totes les factures" />
        <SaTable>
          <thead>
            <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
              <th className="px-4 py-2 font-bold">Escola</th>
              <th className="px-4 py-2 font-bold">Període</th>
              <th className="px-4 py-2 font-bold">Import</th>
              <th className="px-4 py-2 font-bold">Estat</th>
              <th className="px-4 py-2 font-bold text-right">Centre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60 text-sm">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-stone-800/30">
                <td className="px-4 py-3 font-bold text-stone-200">{inv.school_name}</td>
                <td className="px-4 py-3 text-stone-400 text-xs">
                  {inv.period_start} → {inv.period_end}
                </td>
                <td className="px-4 py-3">{Number(inv.amount).toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                  {inv.due_date && <div className="text-[10px] text-stone-600">Venc. {inv.due_date}</div>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/superadmin/escoles/${inv.school_id}?tab=comercial`} className="text-xs text-violet-400 hover:underline">
                    Gestionar
                  </Link>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  Cap factura. Genera esborranys mensuals o crea-les des de cada escola → Comercial.
                </td>
              </tr>
            )}
          </tbody>
        </SaTable>
      </SaPanel>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-lg p-4">
      <div className="text-[11px] uppercase font-bold text-stone-500">{label}</div>
      <div className="text-xl font-black text-white mt-1">{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: 'text-emerald-400',
    overdue: 'text-red-400',
    pending: 'text-amber-400',
    sent: 'text-cyan-400',
    cancelled: 'text-stone-600',
  }
  return (
    <span className={`text-xs font-bold ${colors[status] || 'text-stone-400'}`}>
      {INVOICE_STATUS_LABELS[status] || status}
    </span>
  )
}
