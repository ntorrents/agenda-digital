'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { createSchool } from '@/app/superadmin/actions'
import {
  getEffectivePricePerStudent,
  getSchoolMonthlyPrice,
  getSchoolMrr,
  isSchoolBillingActive,
} from '@/lib/superadmin-billing'
import { isDemoSchool } from '@/lib/superadmin-demo'
import { SaButton, SaInput, SaMessage, SaPanel, SaPanelHeader, SaTable } from './sa-ui'

type SchoolRow = {
  id: string
  name: string
  slug: string
  email: string | null
  created_at: string
  settings: Record<string, unknown> | null
  students: { count: number }[]
  staff: { count: number }[]
}

export function SchoolsListClient({ schools }: { schools: SchoolRow[] }) {
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return schools
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
    )
  }, [schools, query])

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createSchool(fd)
      if (result.error) {
        setMessage({ type: 'err', text: result.error })
        return
      }
      setMessage({ type: 'ok', text: 'Escola creada correctament' })
      setShowCreate(false)
      e.currentTarget.reset()
      if (result.schoolId) {
        window.location.href = `/superadmin/escoles/${result.schoolId}`
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SaInput
          placeholder="Cercar per nom, slug o email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <SaButton type="button" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Cancel·lar' : '+ Nova escola'}
        </SaButton>
      </div>

      {message && <SaMessage type={message.type}>{message.text}</SaMessage>}

      {showCreate && (
        <SaPanel>
          <SaPanelHeader title="Alta d'escola" />
          <form onSubmit={handleCreate} className="p-4 grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase">Nom *</label>
              <SaInput name="name" required placeholder="Escola Bressol Exemple" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase">Slug</label>
              <SaInput name="slug" placeholder="escola-exemple (auto si buit)" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase">Email</label>
              <SaInput name="email" type="email" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase">Telèfon</label>
              <SaInput name="phone" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-stone-500 uppercase">Adreça</label>
              <SaInput name="address" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase">CIF</label>
              <SaInput name="cif" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase">Email contacte</label>
              <SaInput name="contact_email" type="email" />
            </div>
            <div className="sm:col-span-2">
              <SaButton type="submit" disabled={pending}>
                {pending ? 'Creant...' : 'Crear escola'}
              </SaButton>
            </div>
          </form>
        </SaPanel>
      )}

      <SaPanel>
        <SaPanelHeader title={`${filtered.length} escoles`} />
        <SaTable>
          <thead>
            <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
              <th className="px-4 py-2 font-bold">Escola</th>
              <th className="px-4 py-2 font-bold">Alumnes</th>
              <th className="px-4 py-2 font-bold">Personal</th>
              <th className="px-4 py-2 font-bold">Quota/mes</th>
              <th className="px-4 py-2 font-bold">MRR</th>
              <th className="px-4 py-2 font-bold">Estat</th>
              <th className="px-4 py-2 font-bold text-right">Accions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60">
            {filtered.map((school) => {
              const studentCount = school.students?.[0]?.count ?? 0
              const staffCount = school.staff?.[0]?.count ?? 0
              const monthlyPrice = getSchoolMonthlyPrice(school.settings)
              const mrr = getSchoolMrr(school.settings)
              const active = isSchoolBillingActive(school.settings)
              const demo = isDemoSchool(school.settings, school.id)
              const perStudent = getEffectivePricePerStudent(monthlyPrice, studentCount)

              return (
                <tr key={school.id} className="hover:bg-stone-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-stone-200">{school.name}</span>
                      {demo && (
                        <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          DEMO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500">{school.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-300">{studentCount}</td>
                  <td className="px-4 py-3 text-stone-300">{staffCount}</td>
                  <td className="px-4 py-3 text-stone-300">
                    {active ? `${monthlyPrice} €` : '—'}
                    {active && perStudent != null && (
                      <div className="text-[10px] text-stone-600">~{perStudent} €/alumne</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-300">{active ? `${mrr} €` : '0 €'}</td>
                  <td className="px-4 py-3">
                    {demo ? (
                      <span className="text-[10px] font-bold uppercase text-amber-400">Demo</span>
                    ) : (
                      <span
                        className={
                          active
                            ? 'text-[10px] font-bold uppercase text-emerald-400'
                            : 'text-[10px] font-bold uppercase text-amber-400'
                        }
                      >
                        {active ? 'Activa' : 'Pausada'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/superadmin/escoles/${school.id}`}
                      className="text-xs font-bold text-violet-400 hover:text-violet-300"
                    >
                      Gestionar →
                    </Link>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500 text-sm">
                  Cap escola trobada.
                </td>
              </tr>
            )}
          </tbody>
        </SaTable>
      </SaPanel>
    </div>
  )
}
