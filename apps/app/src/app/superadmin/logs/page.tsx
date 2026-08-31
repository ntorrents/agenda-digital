import { Suspense } from 'react'
import { getSuperadminDb } from '@/lib/superadmin'
import { SaPanel, SaPanelHeader } from '@/components/superadmin/sa-ui'
import { SuperadminLogsFilter } from '@/components/superadmin/SuperadminLogsFilter'

export default async function SuperadminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; school?: string }>
}) {
  const params = await searchParams
  const actionFilter = params.action || ''
  const schoolFilter = params.school || ''

  const supabase = await getSuperadminDb()

  const { data: schools } = await supabase.from('schools').select('id, name').order('name')

  let query = supabase
    .from('audit_logs')
    .select('id, action, entity_type, entity_id, school_id, payload, created_at, actor_id')
    .order('created_at', { ascending: false })
    .limit(500)

  if (actionFilter) query = query.eq('action', actionFilter)
  if (schoolFilter) query = query.eq('school_id', schoolFilter)

  const { data: logs, error } = await query

  const tableMissing =
    error?.message?.includes('audit_logs') ||
    error?.code === '42P01' ||
    error?.message?.includes('does not exist')

  const actorIds = [...new Set((logs || []).map((l) => l.actor_id).filter(Boolean))]
  const schoolIds = [...new Set((logs || []).map((l) => l.school_id).filter(Boolean))]

  const [{ data: actors }, { data: schoolRows }] = await Promise.all([
    actorIds.length
      ? supabase.from('profiles').select('id, full_name, email').in('id', actorIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
    schoolIds.length
      ? supabase.from('schools').select('id, name').in('id', schoolIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ])

  const actorById = new Map((actors || []).map((a) => [a.id, a]))
  const schoolById = new Map((schoolRows || []).map((s) => [s.id, s.name]))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">Registre d&apos;auditoria</h2>
        <p className="text-stone-500 text-sm mt-1">
          Accions del superadmin: qui, què, quan i a quin centre.
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
              currentAction={actionFilter}
              currentSchoolId={schoolFilter}
            />
          </Suspense>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
                  <th className="py-2 px-2">Quan</th>
                  <th className="py-2 px-2">Qui</th>
                  <th className="py-2 px-2">Acció</th>
                  <th className="py-2 px-2">Centre</th>
                  <th className="py-2 px-2">Detall</th>
                </tr>
              </thead>
              <tbody>
                {(logs || []).map((row) => {
                  const actor = row.actor_id ? actorById.get(row.actor_id) : null
                  return (
                    <tr key={row.id} className="border-b border-stone-800/50">
                      <td className="py-2 px-2 text-stone-400 whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString('ca-ES')}
                      </td>
                      <td className="py-2 px-2 text-stone-300">
                        {actor?.full_name || actor?.email || '—'}
                      </td>
                      <td className="py-2 px-2 text-violet-300 font-mono">{row.action}</td>
                      <td className="py-2 px-2 text-stone-400">
                        {row.school_id ? schoolById.get(row.school_id) || row.school_id.slice(0, 8) : '—'}
                      </td>
                      <td className="py-2 px-2 text-stone-500 max-w-sm truncate" title={JSON.stringify(row.payload)}>
                        {row.payload && Object.keys(row.payload as object).length > 0
                          ? JSON.stringify(row.payload)
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
                {(!logs || logs.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      Cap registre amb aquests filtres.
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
