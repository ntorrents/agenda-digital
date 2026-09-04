'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { AUDIT_CATEGORY_META, type AuditCategory } from '@/lib/audit-log'
import { SaButton, SaField, SaSelect } from './sa-ui'

const CATEGORY_OPTIONS: { value: '' | AuditCategory; label: string }[] = [
  { value: '', label: 'Totes les categories' },
  ...((Object.keys(AUDIT_CATEGORY_META) as AuditCategory[]).map((key) => ({
    value: key,
    label: AUDIT_CATEGORY_META[key].label,
  }))),
]

export function SuperadminLogsFilter({
  schools,
  currentCategory,
  currentAction,
  currentSchoolId,
  errorsOnly,
  actionOptions,
}: {
  schools: { id: string; name: string }[]
  currentCategory: string
  currentAction: string
  currentSchoolId: string
  errorsOnly: boolean
  actionOptions: { value: string; label: string }[]
}) {
  const router = useRouter()

  const buildParams = (overrides?: {
    category?: string
    action?: string
    school?: string
    errors?: boolean
  }) => {
    const params = new URLSearchParams()
    const category = overrides?.category ?? currentCategory
    const action = overrides?.action ?? currentAction
    const school = overrides?.school ?? currentSchoolId
    const errors = overrides?.errors ?? errorsOnly
    if (category) params.set('category', category)
    if (action) params.set('action', action)
    if (school) params.set('school', school)
    if (errors) params.set('severity', 'ERROR')
    return params
  }

  const apply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = buildParams({
      category: (fd.get('category') as string) || '',
      action: (fd.get('action') as string) || '',
      school: (fd.get('school') as string) || '',
      errors: errorsOnly,
    })
    router.push(`/superadmin/logs?${params.toString()}`)
  }

  const clear = () => {
    router.push('/superadmin/logs')
  }

  const toggleErrorsOnly = () => {
    const params = buildParams({ errors: !errorsOnly })
    router.push(`/superadmin/logs?${params.toString()}`)
  }

  const hasFilters = !!(currentCategory || currentAction || currentSchoolId || errorsOnly)

  return (
    <div className="border-b border-stone-800">
      <div className="px-4 pt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleErrorsOnly}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
            errorsOnly
              ? 'border-red-500/60 bg-red-500/20 text-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.35)]'
              : 'border-stone-700 bg-stone-900/60 text-stone-400 hover:border-red-500/40 hover:text-red-300'
          }`}
        >
          <AlertTriangle className={`h-3.5 w-3.5 ${errorsOnly ? 'text-red-300' : ''}`} />
          {errorsOnly ? 'Mostrant només errors' : 'Només errors'}
        </button>
        {errorsOnly && (
          <span className="text-[11px] text-red-400/80 font-medium">
            Filtre actiu: severity = ERROR
          </span>
        )}
      </div>

      <form
        onSubmit={apply}
        className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
      >
        <SaField label="Categoria">
          <SaSelect name="category" defaultValue={currentCategory}>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </SaSelect>
        </SaField>
        <SaField label="Acció concreta">
          <SaSelect name="action" defaultValue={currentAction}>
            <option value="">Totes les accions</option>
            {actionOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SaSelect>
        </SaField>
        <SaField label="Escola">
          <SaSelect name="school" defaultValue={currentSchoolId}>
            <option value="">Totes</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SaSelect>
        </SaField>
        <div className="flex gap-2">
          <SaButton type="submit">Filtrar</SaButton>
          {hasFilters && (
            <SaButton type="button" variant="ghost" onClick={clear}>
              Netejar
            </SaButton>
          )}
        </div>
      </form>
    </div>
  )
}
