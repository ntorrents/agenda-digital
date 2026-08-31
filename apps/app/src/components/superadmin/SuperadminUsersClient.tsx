'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { searchGlobalUsers, type GlobalUserRow } from '@/app/superadmin/erp-actions'
import { SaButton, SaInput, SaPanel, SaPanelHeader, SaTable } from './sa-ui'
import { SaImpersonateButton } from './SaImpersonateButton'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Directora',
  teacher: 'Educador/a',
  auxiliary: 'Auxiliar',
  guardian: 'Família',
}

export function SuperadminUsersClient() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<GlobalUserRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const r = await searchGlobalUsers(query)
      if (r.error) setError(r.error)
      else {
        setError(null)
        setUsers(r.users)
      }
    })
  }

  return (
    <div className="space-y-4">
      <SaPanel>
        <SaPanelHeader title="Cerca global d'usuaris" />
        <form onSubmit={handleSearch} className="p-4 flex gap-2">
          <SaInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Email o nom (mín. 2 caràcters)"
            className="flex-1"
          />
          <SaButton type="submit" disabled={pending || query.trim().length < 2}>
            Cercar
          </SaButton>
        </form>
      </SaPanel>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <SaPanel>
        <SaPanelHeader title={`Resultats (${users.length})`} />
        <SaTable>
          <thead>
            <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
              <th className="px-4 py-2 font-bold">Usuari</th>
              <th className="px-4 py-2 font-bold">Rol</th>
              <th className="px-4 py-2 font-bold">Escola</th>
              <th className="px-4 py-2 font-bold">Accés</th>
              <th className="px-4 py-2 font-bold text-right">Accions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60 text-sm">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-bold text-stone-200">{u.full_name || '—'}</div>
                  <div className="text-xs text-stone-500">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-stone-400">{ROLE_LABELS[u.role] || u.role}</td>
                <td className="px-4 py-3">
                  {u.school_name ? (
                    <Link href={`/superadmin/escoles/${u.school_id}`} className="text-violet-400 hover:underline text-xs">
                      {u.school_name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  {u.status !== 'active' && <span className="text-red-400">Inactiu · </span>}
                  {u.welcome_email_sent ? (
                    <span className="text-emerald-400">Enviat</span>
                  ) : (
                    <span className="text-amber-400">Sense enviar</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.status === 'active' && <SaImpersonateButton userId={u.id} />}
                </td>
              </tr>
            ))}
            {users.length === 0 && query.length >= 2 && !pending && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  Cap resultat.
                </td>
              </tr>
            )}
            {query.length < 2 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                  Introdueix almenys 2 caràcters per cercar.
                </td>
              </tr>
            )}
          </tbody>
        </SaTable>
      </SaPanel>
    </div>
  )
}
