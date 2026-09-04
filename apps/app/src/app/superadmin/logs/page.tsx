import { Suspense } from 'react'
import { getSuperadminDb } from '@/lib/superadmin'
import { SaPanel, SaPanelHeader } from '@/components/superadmin/sa-ui'
import { SuperadminLogsFilter } from '@/components/superadmin/SuperadminLogsFilter'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_CATEGORY_META,
  getAuditActionLabel,
  getAuditCategory,
  roleLoginLabel,
  type AuditCategory,
} from '@/lib/audit-log'

function formatPayload(action: string, payload: Record<string, unknown> | null) {
  if (!payload || Object.keys(payload).length === 0) return '—'

  if (action === 'auth.login') {
    const role = roleLoginLabel(payload.role as string)
    const email = (payload.email as string) || ''
    const name = (payload.fullName as string) || ''
    return [role, name, email].filter(Boolean).join(' · ')
  }

  if (action.startsWith('agenda.')) {
    const parts = [
      payload.date ? `Data: ${payload.date}` : null,
      payload.studentId ? `Alumne: ${String(payload.studentId).slice(0, 8)}…` : null,
      payload.count != null ? `${payload.count} agendes` : null,
    ].filter(Boolean)
    return parts.join(' · ') || JSON.stringify(payload)
  }

  if (payload.title) return String(payload.title)
  if (payload.firstName || payload.lastName) {
    return `${payload.firstName || ''} ${payload.lastName || ''}`.trim()
  }
  if (payload.email) return String(payload.email)

  const compact = { ...payload }
  delete compact.actorRole
  delete compact.actorEmail
  if (Object.keys(compact).length === 0) return '—'
  return JSON.stringify(compact)
}

export default async function SuperadminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; action?: string; school?: string }>
}) {
  const params = await searchParams
  const categoryFilter = (params.category || '') as AuditCategory | ''
  const actionFilter = params.action || ''
  const schoolFilter = params.school || ''

  const supabase = await getSuperadminDb()

  const { data: schools } = await supabase.from('schools').select('id, name').order('name')

  let query = supabase
    .from('audit_logs')
    .select('id, action, entity_type, entity_id, school_id, payload, created_at, actor_id')
    .order('created_at', { ascending: false })
    .limit(500)

  if (actionFilter) {
    query = query.eq('action', actionFilter)
  } else if (categoryFilter && AUDIT_CATEGORY_META[categoryFilter]) {
    query = query.in('action', AUDIT_CATEGORY_META[categoryFilter].actions)
  }

  if (schoolFilter) query = query.eq('school_id', schoolFilter)

  const { data: logs, error } = await query

  const tableMissing =
    error?.message?.includes('audit_logs') ||
    error?.code === '42P01' ||
    error?.message?.includes('does not exist')

  const actorIds = [...new Set((logs || []).map((l) => l.actor_id).filter(Boolean))] as string[]
  const schoolIds = [...new Set((logs || []).map((l) => l.school_id).filter(Boolean))] as string[]

  const [{ data: actors }, { data: schoolRows }] = await Promise.all([
    actorIds.length
      ? supabase.from('profiles').select('id, full_name, email, role').in('id', actorIds)
      : Promise.resolve({
          data: [] as { id: string; full_name: string | null; email: string | null; role: string | null }[],
        }),
    schoolIds.length
      ? supabase.from('schools').select('id, name').in('id', schoolIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ])

  const actorById = new Map((actors || []).map((a) => [a.id, a]))
  const schoolById = new Map((schoolRows || []).map((s) => [s.id, s.name]))

  const actionOptions = Object.entries(AUDIT_ACTION_LABELS)
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ca'))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">Registre d&apos;auditoria</h2>
        <p className="text-stone-500 text-sm mt-1">
          Logins, agendes, avisos, canvis d&apos;alumnes i accions de superadmin. Filtra per categoria o
          acció.
        </p>
      </div>

      {tableMissing ? (
        <SaPanel>
          <SaPanelHeader title="Migració pendent" />
          <div className="p-4 text-sm text-stone-400 space-y-2">
            <p>
              Executa <code className="text-stone-300">apps/app/scripts/audit-logs.sql</code> al SQL Editor de
              Supabase.
            </p>
          </div>
        </SaPanel>
      ) : error ? (
        <SaPanel>
          <div className="p-4 text-sm text-red-400">{error.message}</div>
        </SaPanel>
      ) : (
        <SaPanel>
          <SaPanelHeader title={`Esdeveniments (${logs?.length || 0})`} />
          <Suspense fallback={null}>
            <SuperadminLogsFilter
              schools={schools || []}
              currentCategory={categoryFilter}
              currentAction={actionFilter}
              currentSchoolId={schoolFilter}
              actionOptions={actionOptions}
            />
          </Suspense>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
                  <th className="py-2 px-2">Quan</th>
                  <th className="py-2 px-2">Qui</th>
                  <th className="py-2 px-2">Tipus</th>
                  <th className="py-2 px-2">Acció</th>
                  <th className="py-2 px-2">Centre</th>
                  <th className="py-2 px-2">Detall</th>
                </tr>
              </thead>
              <tbody>
                {(logs || []).map((row) => {
                  const actor = row.actor_id ? actorById.get(row.actor_id) : null
                  const category = getAuditCategory(row.action)
                  const catMeta = AUDIT_CATEGORY_META[category]
                  const payload = (row.payload || {}) as Record<string, unknown>
                  return (
                    <tr key={row.id} className="border-b border-stone-800/50 hover:bg-stone-800/20">
                      <td className="py-2.5 px-2 text-stone-400 whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString('ca-ES')}
                      </td>
                      <td className="py-2.5 px-2 text-stone-300">
                        <div className="font-medium">{actor?.full_name || actor?.email || '—'}</div>
                        {actor?.role && (
                          <div className="text-[10px] text-stone-500">{roleLoginLabel(actor.role)}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${catMeta.color}`}
                        >
                          {catMeta.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-violet-300">
                        <div className="font-medium">{getAuditActionLabel(row.action)}</div>
                        <div className="text-[10px] text-stone-600 font-mono">{row.action}</div>
                      </td>
                      <td className="py-2.5 px-2 text-stone-400">
                        {row.school_id ? schoolById.get(row.school_id) || row.school_id.slice(0, 8) : '—'}
                      </td>
                      <td
                        className="py-2.5 px-2 text-stone-400 max-w-xs truncate"
                        title={JSON.stringify(payload)}
                      >
                        {formatPayload(row.action, payload)}
                      </td>
                    </tr>
                  )
                })}
                {(!logs || logs.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500">
                      Cap registre amb aquests filtres. Els nous esdeveniments apareixeran en fer login,
                      guardar agendes, etc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SaPanel>
      )}
    </div>
  )
}
