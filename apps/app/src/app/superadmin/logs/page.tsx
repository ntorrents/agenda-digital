import { Suspense } from 'react'
import { AlertTriangle } from 'lucide-react'
import { getSuperadminDb } from '@/lib/superadmin'
import { SaPanel, SaPanelHeader } from '@/components/superadmin/sa-ui'
import { SuperadminLogsFilter } from '@/components/superadmin/SuperadminLogsFilter'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_CATEGORY_META,
  AUDIT_SEVERITY_META,
  getAuditActionLabel,
  getAuditCategory,
  normalizeAuditSeverity,
  roleLoginLabel,
  type AuditCategory,
} from '@/lib/audit-log'

function formatPayload(action: string, payload: Record<string, unknown> | null) {
  if (!payload || Object.keys(payload).length === 0) return '—'

  if (action === 'auth.login' || action === 'auth.login_failed') {
    const role = roleLoginLabel(payload.role as string)
    const email = (payload.email as string) || ''
    const name = (payload.fullName as string) || ''
    const message = (payload.message as string) || ''
    if (action === 'auth.login_failed') {
      return [email, message].filter(Boolean).join(' · ') || '—'
    }
    return [role, name, email].filter(Boolean).join(' · ')
  }

  if (action.startsWith('error.') || payload.message) {
    return String(payload.message || JSON.stringify(payload))
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
  delete compact.stack
  if (Object.keys(compact).length === 0) return '—'
  return JSON.stringify(compact)
}

export default async function SuperadminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    action?: string
    school?: string
    severity?: string
  }>
}) {
  const params = await searchParams
  const categoryFilter = (params.category || '') as AuditCategory | ''
  const actionFilter = params.action || ''
  const schoolFilter = params.school || ''
  const errorsOnly = params.severity === 'ERROR'

  const supabase = await getSuperadminDb()

  const { data: schools } = await supabase.from('schools').select('id, name').order('name')

  let query = supabase
    .from('audit_logs')
    .select('id, action, entity_type, entity_id, school_id, payload, severity, created_at, actor_id')
    .order('created_at', { ascending: false })
    .limit(500)

  if (errorsOnly) {
    query = query.eq('severity', 'ERROR')
  }

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

  const severityColumnMissing =
    !!error?.message?.includes('severity') ||
    (!!error?.message?.toLowerCase().includes('column') &&
      !!error?.message?.includes('severity'))

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
          Logins, agendes, avisos, canvis d&apos;alumnes, errors operatius i accions de superadmin.
        </p>
      </div>

      {tableMissing ? (
        <SaPanel>
          <SaPanelHeader title="Migració pendent" />
          <div className="p-4 text-sm text-stone-400 space-y-2">
            <p>
              Executa <code className="text-stone-300">apps/app/scripts/audit-logs.sql</code> al SQL
              Editor de Supabase.
            </p>
          </div>
        </SaPanel>
      ) : severityColumnMissing ? (
        <SaPanel>
          <SaPanelHeader title="Migració de severitat pendent" />
          <div className="p-4 text-sm text-stone-400 space-y-2">
            <p>
              Executa <code className="text-stone-300">apps/app/scripts/audit-logs-severity.sql</code>{' '}
              a PRE i PRO per afegir la columna <code className="text-stone-300">severity</code>.
            </p>
          </div>
        </SaPanel>
      ) : error ? (
        <SaPanel>
          <div className="p-4 text-sm text-red-400">{error.message}</div>
        </SaPanel>
      ) : (
        <SaPanel>
          <SaPanelHeader
            title={
              errorsOnly
                ? `Errors (${logs?.length || 0})`
                : `Esdeveniments (${logs?.length || 0})`
            }
          />
          <Suspense fallback={null}>
            <SuperadminLogsFilter
              schools={schools || []}
              currentCategory={categoryFilter}
              currentAction={actionFilter}
              currentSchoolId={schoolFilter}
              errorsOnly={errorsOnly}
              actionOptions={actionOptions}
            />
          </Suspense>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
                  <th className="py-2 px-2">Quan</th>
                  <th className="py-2 px-2">Nivell</th>
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
                  const severity = normalizeAuditSeverity(row.severity)
                  const severityMeta = AUDIT_SEVERITY_META[severity]
                  const payload = (row.payload || {}) as Record<string, unknown>
                  const isError = severity === 'ERROR'
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-stone-800/50 ${
                        isError
                          ? 'bg-red-950/35 hover:bg-red-950/50 border-l-2 border-l-red-500'
                          : 'hover:bg-stone-800/20'
                      }`}
                    >
                      <td className="py-2.5 px-2 text-stone-400 whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString('ca-ES', {
                          timeZone: 'Europe/Madrid',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${severityMeta.color}`}
                        >
                          {isError && <AlertTriangle className="h-3 w-3" />}
                          {severityMeta.label}
                        </span>
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
                      <td className={`py-2.5 px-2 ${isError ? 'text-red-300' : 'text-violet-300'}`}>
                        <div className="font-medium">{getAuditActionLabel(row.action)}</div>
                        <div className="text-[10px] text-stone-600 font-mono">{row.action}</div>
                      </td>
                      <td className="py-2.5 px-2 text-stone-400">
                        {row.school_id ? schoolById.get(row.school_id) || row.school_id.slice(0, 8) : '—'}
                      </td>
                      <td
                        className={`py-2.5 px-2 max-w-xs truncate ${isError ? 'text-red-200/90' : 'text-stone-400'}`}
                        title={JSON.stringify(payload)}
                      >
                        {formatPayload(row.action, payload)}
                      </td>
                    </tr>
                  )
                })}
                {(!logs || logs.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      {errorsOnly
                        ? 'Cap error registrat amb aquests filtres.'
                        : 'Cap registre amb aquests filtres. Els nous esdeveniments apareixeran en fer login, guardar agendes, etc.'}
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
