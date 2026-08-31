'use client'

import { useRouter } from 'next/navigation'
import { SaButton, SaField, SaSelect } from './sa-ui'

const ACTION_OPTIONS = [
  { value: '', label: 'Totes les accions' },
  { value: 'school.create', label: 'Escola creada' },
  { value: 'school.update', label: 'Escola actualitzada' },
  { value: 'school.delete', label: 'Escola eliminada' },
  { value: 'classroom.create', label: 'Aula creada' },
  { value: 'classroom.update', label: 'Aula actualitzada' },
  { value: 'classroom.delete', label: 'Aula eliminada' },
  { value: 'staff.create', label: 'Personal creat' },
  { value: 'staff.update', label: 'Personal actualitzat' },
  { value: 'staff.archive', label: 'Personal baixa' },
  { value: 'staff.send_access', label: 'Accés enviat' },
  { value: 'student.create', label: 'Alumne creat' },
  { value: 'student.update', label: 'Alumne actualitzat' },
  { value: 'student.archive', label: 'Alumne arxivat' },
  { value: 'import.execute', label: 'Importació Excel' },
]

export function SuperadminLogsFilter({
  schools,
  currentAction,
  currentSchoolId,
}: {
  schools: { id: string; name: string }[]
  currentAction: string
  currentSchoolId: string
}) {
  const router = useRouter()

  const apply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const action = fd.get('action') as string
    const school = fd.get('school') as string
    if (action) params.set('action', action)
    if (school) params.set('school', school)
    router.push(`/superadmin/logs?${params.toString()}`)
  }

  const clear = () => {
    router.push('/superadmin/logs')
  }

  return (
    <form onSubmit={apply} className="p-4 grid sm:grid-cols-3 gap-3 items-end border-b border-stone-800">
      <SaField label="Acció">
        <SaSelect name="action" defaultValue={currentAction}>
          {ACTION_OPTIONS.map((o) => (
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
        {(currentAction || currentSchoolId) && (
          <SaButton type="button" variant="ghost" onClick={clear}>
            Netejar
          </SaButton>
        )}
      </div>
    </form>
  )
}
