'use client'

import { useRouter } from 'next/navigation'
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
  actionOptions,
}: {
  schools: { id: string; name: string }[]
  currentCategory: string
  currentAction: string
  currentSchoolId: string
  actionOptions: { value: string; label: string }[]
}) {
  const router = useRouter()

  const apply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const category = fd.get('category') as string
    const action = fd.get('action') as string
    const school = fd.get('school') as string
    if (category) params.set('category', category)
    if (action) params.set('action', action)
    if (school) params.set('school', school)
    router.push(`/superadmin/logs?${params.toString()}`)
  }

  const clear = () => {
    router.push('/superadmin/logs')
  }

  const hasFilters = !!(currentCategory || currentAction || currentSchoolId)

  return (
    <form onSubmit={apply} className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end border-b border-stone-800">
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
  )
}
