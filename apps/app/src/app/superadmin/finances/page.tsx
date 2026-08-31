import { getSuperadminDb } from '@/lib/superadmin'
import { getSchoolMrr, isSchoolBillingActive } from '@/lib/superadmin-billing'
import { isErpTableMissing } from '@/lib/superadmin-commercial'
import { SuperadminFinancesClient } from '@/components/superadmin/SuperadminFinancesClient'

export default async function SuperadminFinancesPage() {
  const admin = await getSuperadminDb()

  const { data: schools } = await admin.from('schools').select('id, name, settings').order('name')

  const { data: invoicesRaw, error: invError } = await admin
    .from('school_invoices')
    .select('id, school_id, period_start, period_end, amount, status, due_date, paid_at, reference')
    .order('period_start', { ascending: false })
    .limit(200)

  const erpTablesMissing = isErpTableMissing(invError)

  const schoolMap = new Map((schools || []).map((s) => [s.id, s.name]))

  const invoices = (invoicesRaw || []).map((inv) => ({
    ...inv,
    school_name: schoolMap.get(inv.school_id) || inv.school_id.slice(0, 8),
    amount: Number(inv.amount),
  }))

  const totalMrr = (schools || []).reduce((sum, s) => {
    if (!isSchoolBillingActive(s.settings)) return sum
    return sum + getSchoolMrr(s.settings)
  }, 0)

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const pendingAmount = invoices
    .filter((i) => ['pending', 'sent', 'overdue'].includes(i.status))
    .reduce((s, i) => s + i.amount, 0)

  const overdueCount = invoices.filter((i) => i.status === 'overdue').length

  const paidThisMonth = invoices
    .filter((i) => i.status === 'paid' && i.paid_at && i.paid_at >= monthStart)
    .reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">Finances (ERP)</h2>
        <p className="text-stone-500 text-sm mt-1">
          Factures, cobraments, exportació i generació massiva per mes.
        </p>
      </div>
      <SuperadminFinancesClient
        invoices={invoices}
        erpTablesMissing={erpTablesMissing}
        summary={{ totalMrr, pendingAmount, overdueCount, paidThisMonth }}
      />
    </div>
  )
}
