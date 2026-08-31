'use client'

import { useState, useTransition } from 'react'
import {
  createSchoolInvoice,
  deleteSchoolDocument,
  updateSchoolCommercial,
  updateSchoolInvoice,
  uploadSchoolDocument,
} from '@/app/superadmin/erp-actions'
import {
  DOC_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  type BillingEvent,
  type CommercialSettings,
  type SchoolDocument,
  type SchoolInvoice,
} from '@/lib/superadmin-commercial'
import { SaButton, SaField, SaInput, SaPanel, SaPanelHeader, SaSelect, SaTable, SaTextarea } from './sa-ui'

export function SchoolCommercialTab({
  schoolId,
  commercial,
  documents,
  invoices,
  billingEvents,
  monthlyPrice,
  erpTablesMissing,
  onMessage,
}: {
  schoolId: string
  commercial: CommercialSettings
  documents: SchoolDocument[]
  invoices: SchoolInvoice[]
  billingEvents: BillingEvent[]
  monthlyPrice: number
  erpTablesMissing: boolean
  onMessage: (msg: { type: 'ok' | 'err'; text: string }) => void
}) {
  const [pending, startTransition] = useTransition()
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showDocForm, setShowDocForm] = useState(false)

  function run(action: () => Promise<{ error?: string; success?: boolean }>, ok: string) {
    startTransition(async () => {
      const r = await action()
      if (r.error && !r.success) onMessage({ type: 'err', text: r.error })
      else onMessage({ type: 'ok', text: ok })
    })
  }

  if (erpTablesMissing) {
    return (
      <div className="p-4 bg-amber-950/30 border border-amber-800 rounded-lg text-sm text-amber-200">
        Executa <code className="text-amber-100">apps/app/scripts/superadmin-erp.sql</code> a Supabase per activar
        documents, factures i historial de tarifes.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SaPanel>
        <SaPanelHeader title="Dades comercials i contracte" />
        <form
          className="p-4 grid sm:grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            run(() => updateSchoolCommercial(schoolId, new FormData(e.currentTarget)), 'Dades comercials desades')
          }}
        >
          <SaField label="Raó social / entitat legal">
            <SaInput name="legal_entity_name" defaultValue={commercial.legal_entity_name || ''} />
          </SaField>
          <SaField label="Cicle facturació">
            <SaSelect name="billing_cycle" defaultValue={commercial.billing_cycle || 'monthly'}>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="annual">Anual</option>
            </SaSelect>
          </SaField>
          <SaField label="Inici contracte">
            <SaInput name="contract_start" type="date" defaultValue={commercial.contract_start || ''} />
          </SaField>
          <SaField label="Fi contracte">
            <SaInput name="contract_end" type="date" defaultValue={commercial.contract_end || ''} />
          </SaField>
          <SaField label="Data renovació">
            <SaInput name="renewal_date" type="date" defaultValue={commercial.renewal_date || ''} />
          </SaField>
          <SaField label="Fi període prova">
            <SaInput name="trial_end" type="date" defaultValue={commercial.trial_end || ''} />
          </SaField>
          <SaField label="Propera revisió comercial">
            <SaInput name="next_review_date" type="date" defaultValue={commercial.next_review_date || ''} />
          </SaField>
          <SaField label="Termini pagament (dies)">
            <SaInput
              name="payment_terms_days"
              type="number"
              min={0}
              defaultValue={String(commercial.payment_terms_days ?? 30)}
            />
          </SaField>
          <SaField label="Email facturació">
            <SaInput name="billing_email" type="email" defaultValue={commercial.billing_email || ''} />
          </SaField>
          <SaField label="Contacte comercial">
            <SaInput name="commercial_contact_name" defaultValue={commercial.commercial_contact_name || ''} />
          </SaField>
          <SaField label="Email contacte">
            <SaInput name="commercial_contact_email" type="email" defaultValue={commercial.commercial_contact_email || ''} />
          </SaField>
          <SaField label="Telèfon contacte">
            <SaInput name="commercial_contact_phone" defaultValue={commercial.commercial_contact_phone || ''} />
          </SaField>
          <div className="sm:col-span-2">
            <SaField label="Adreça facturació">
              <SaTextarea name="billing_address" defaultValue={commercial.billing_address || ''} />
            </SaField>
          </div>
          <SaField label="IBAN / notes pagament">
            <SaInput name="iban_or_payment_notes" defaultValue={commercial.iban_or_payment_notes || ''} />
          </SaField>
          <SaField label="IVA">
            <label className="flex items-center gap-2 text-sm text-stone-300 mt-2">
              <input type="checkbox" name="vat_included" defaultChecked={commercial.vat_included !== false} />
              Preu amb IVA inclòs
            </label>
          </SaField>
          <div className="sm:col-span-2">
            <SaField label="Notes internes">
              <SaTextarea name="internal_notes" defaultValue={commercial.internal_notes || ''} />
            </SaField>
          </div>
          <p className="sm:col-span-2 text-[11px] text-stone-600">
            Quota mensual actual del centre: <strong className="text-stone-400">{monthlyPrice} €</strong> (editable a
            pestanya Dades → Facturació).
          </p>
          <SaButton type="submit" disabled={pending}>
            Desar comercial
          </SaButton>
        </form>
      </SaPanel>

      <SaPanel>
        <SaPanelHeader
          title="Documents (contracte, NDA, annexos)"
          action={
            <SaButton type="button" variant="secondary" onClick={() => setShowDocForm((v) => !v)}>
              {showDocForm ? 'Cancel·lar' : 'Pujar document'}
            </SaButton>
          }
        />
        {showDocForm && (
          <form
            className="p-4 border-b border-stone-800 grid sm:grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              run(async () => {
                const r = await uploadSchoolDocument(schoolId, new FormData(e.currentTarget))
                if (r.success) setShowDocForm(false)
                return r
              }, 'Document pujat')
            }}
          >
            <SaField label="Tipus">
              <SaSelect name="doc_type" defaultValue="contract">
                {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </SaSelect>
            </SaField>
            <SaField label="Títol">
              <SaInput name="title" required placeholder="Contracte 2025 signat" />
            </SaField>
            <SaField label="Data signatura">
              <SaInput name="signed_at" type="date" />
            </SaField>
            <SaField label="Caducitat">
              <SaInput name="expires_at" type="date" />
            </SaField>
            <SaField label="Arxiu (PDF/imatge)">
              <SaInput name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" required />
            </SaField>
            <SaField label="Notes">
              <SaInput name="notes" />
            </SaField>
            <SaButton type="submit" disabled={pending}>
              Pujar
            </SaButton>
          </form>
        )}
        <SaTable>
          <thead>
            <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
              <th className="px-4 py-2 font-bold">Document</th>
              <th className="px-4 py-2 font-bold">Signatura</th>
              <th className="px-4 py-2 font-bold text-right">Accions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60 text-sm">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-4 py-3">
                  <div className="font-bold text-stone-200">{doc.title}</div>
                  <div className="text-[11px] text-stone-500">
                    {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
                    {doc.file_name && ` · ${doc.file_name}`}
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-400 text-xs">
                  {doc.signed_at ? new Date(doc.signed_at).toLocaleDateString('ca-ES') : '—'}
                  {doc.expires_at && (
                    <div className="text-stone-600">Caduca: {new Date(doc.expires_at).toLocaleDateString('ca-ES')}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:underline">
                    Obrir
                  </a>
                  <button
                    type="button"
                    className="text-xs text-red-400 hover:underline"
                    onClick={() => {
                      if (!confirm('Eliminar document?')) return
                      run(() => deleteSchoolDocument(schoolId, doc.id), 'Document eliminat')
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-stone-500 text-sm">
                  Cap document pujat.
                </td>
              </tr>
            )}
          </tbody>
        </SaTable>
      </SaPanel>

      <SaPanel>
        <SaPanelHeader
          title="Factures i cobraments"
          action={
            <SaButton type="button" variant="secondary" onClick={() => setShowInvoiceForm((v) => !v)}>
              {showInvoiceForm ? 'Cancel·lar' : 'Nova factura'}
            </SaButton>
          }
        />
        {showInvoiceForm && (
          <form
            className="p-4 border-b border-stone-800 grid sm:grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              if (!fd.get('amount')) fd.set('amount', String(monthlyPrice))
              run(async () => {
                const r = await createSchoolInvoice(schoolId, fd)
                if (r.success) setShowInvoiceForm(false)
                return r
              }, 'Factura creada')
            }}
          >
            <SaField label="Període inici">
              <SaInput name="period_start" type="date" required />
            </SaField>
            <SaField label="Període fi">
              <SaInput name="period_end" type="date" required />
            </SaField>
            <SaField label="Import (€)">
              <SaInput name="amount" type="number" step="0.01" defaultValue={String(monthlyPrice)} required />
            </SaField>
            <SaField label="Venciment">
              <SaInput name="due_date" type="date" />
            </SaField>
            <SaField label="Referència">
              <SaInput name="reference" placeholder="PD-202508-..." />
            </SaField>
            <SaField label="Estat">
              <SaSelect name="status" defaultValue="pending">
                {Object.entries(INVOICE_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </SaSelect>
            </SaField>
            <div className="sm:col-span-2">
              <SaField label="Notes">
                <SaInput name="notes" />
              </SaField>
            </div>
            <SaButton type="submit" disabled={pending}>
              Crear factura
            </SaButton>
          </form>
        )}
        <SaTable>
          <thead>
            <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
              <th className="px-4 py-2 font-bold">Període</th>
              <th className="px-4 py-2 font-bold">Import</th>
              <th className="px-4 py-2 font-bold">Estat</th>
              <th className="px-4 py-2 font-bold text-right">Accions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60 text-sm">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 text-stone-300">
                  {inv.period_start} → {inv.period_end}
                  {inv.reference && <div className="text-[11px] text-stone-600">{inv.reference}</div>}
                </td>
                <td className="px-4 py-3 font-bold text-stone-200">{Number(inv.amount).toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <InvoiceStatusSelect
                    schoolId={schoolId}
                    invoice={inv}
                    disabled={pending}
                    onUpdate={(msg) => onMessage(msg)}
                  />
                </td>
                <td className="px-4 py-3 text-right text-xs text-stone-500">
                  {inv.due_date && <div>Venc.: {inv.due_date}</div>}
                  {inv.paid_at && <div>Pagada: {new Date(inv.paid_at).toLocaleDateString('ca-ES')}</div>}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-stone-500 text-sm">
                  Cap factura registrada.
                </td>
              </tr>
            )}
          </tbody>
        </SaTable>
      </SaPanel>

      {billingEvents.length > 0 && (
        <SaPanel>
          <SaPanelHeader title="Historial de quotes mensuals" />
          <SaTable>
            <thead>
              <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
                <th className="px-4 py-2 font-bold">Des de</th>
                <th className="px-4 py-2 font-bold">Quota</th>
                <th className="px-4 py-2 font-bold">Motiu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-sm">
              {billingEvents.map((ev) => (
                <tr key={ev.id}>
                  <td className="px-4 py-3 text-stone-400">{ev.effective_from}</td>
                  <td className="px-4 py-3 font-bold text-stone-200">{Number(ev.monthly_price).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{ev.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </SaTable>
        </SaPanel>
      )}
    </div>
  )
}

function InvoiceStatusSelect({
  schoolId,
  invoice,
  disabled,
  onUpdate,
}: {
  schoolId: string
  invoice: SchoolInvoice
  disabled: boolean
  onUpdate: (msg: { type: 'ok' | 'err'; text: string }) => void
}) {
  return (
    <select
      className="bg-stone-950 border border-stone-700 rounded px-2 py-1 text-xs text-stone-200"
      defaultValue={invoice.status}
      disabled={disabled}
      onChange={async (e) => {
        const fd = new FormData()
        fd.set('id', invoice.id)
        fd.set('status', e.target.value)
        if (e.target.value === 'paid') fd.set('paid_at', new Date().toISOString().slice(0, 10))
        const r = await updateSchoolInvoice(schoolId, fd)
        if (r.error) onUpdate({ type: 'err', text: r.error })
        else onUpdate({ type: 'ok', text: 'Factura actualitzada' })
      }}
    >
      {Object.entries(INVOICE_STATUS_LABELS).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  )
}
