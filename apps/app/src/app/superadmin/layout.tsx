import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SuperadminLogout } from '@/components/superadmin/SuperadminLogout'

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const tCommon = await getTranslations('common')

  if (!user) redirect('/login')

  const metaRole = user.app_metadata?.role as string | undefined
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, force_password_reset')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || metaRole
  if (role !== 'superadmin') redirect('/login')

  if (profile?.force_password_reset) redirect('/force-password-reset')

  const nav = [
    { href: '/superadmin', label: 'Panoràmica' },
    { href: '/superadmin/escoles', label: 'Escoles' },
    { href: '/superadmin/finances', label: 'Finances' },
    { href: '/superadmin/importar', label: 'Importació' },
    { href: '/superadmin/alertes', label: 'Alertes' },
    { href: '/superadmin/usuaris', label: 'Usuaris' },
    { href: '/superadmin/logs', label: 'Auditoria' },
    { href: '/superadmin/ajustes', label: 'Ajustos' },
  ]

  return (
    <div className="min-h-screen bg-stone-950 text-stone-300 font-sans flex">
      <aside className="w-52 bg-stone-900 border-r border-stone-800 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-14 flex items-center px-4 border-b border-stone-800">
          <div>
            <h1 className="text-xs font-black text-white">Petit Diari</h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider">Superadmin</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 rounded text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-stone-800 space-y-2">
          <p className="text-[10px] text-stone-600 truncate px-1" title={user.email || ''}>
            {user.email}
          </p>
          <SuperadminLogout label={tCommon('logout')} />
        </div>
      </aside>

      <main className="flex-1 ml-52 min-h-screen">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
