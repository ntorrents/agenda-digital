import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Home, Building, FileSpreadsheet, Settings, Crown, Database } from 'lucide-react'
import { headers } from 'next/headers'
import { getTranslations, getLocale } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Locale } from '@/i18n'

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tNav = await getTranslations('navigation')
  const tCommon = await getTranslations('common')
  const locale = await getLocale() as Locale

  // TEMPORARY DEMO BYPASS: We disable the auth check so you can view the UI without the DB migration
  /*
  if (!user) {
    redirect('/login')
  }

  // Ensure role is superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    // If not superadmin, kick them back to login or their normal dashboard
    redirect('/login')
  }
  */

  // We could use headers to check the active route, but for simplicity we'll just style all links the same for now, 
  // or build a tiny client component for the active state later.
  
  return (
    <div className="min-h-screen bg-stone-950 text-stone-300 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col fixed inset-y-0 left-0 z-50">
        
        {/* Branding */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight leading-tight">Master Control</h1>
              <p className="text-[10px] font-bold text-violet-400 tracking-widest uppercase">Super Admin</p>
            </div>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <Link href="/superadmin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 hover:text-white transition-colors group">
            <Home className="h-4 w-4 text-stone-400 group-hover:text-violet-400 transition-colors" />
            {tNav('dashboard')}
          </Link>
          <Link href="/superadmin/escoles" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 hover:text-white transition-colors group">
            <Building className="h-4 w-4 text-stone-400 group-hover:text-violet-400 transition-colors" />
            {tNav('schools')}
          </Link>
          <Link href="/superadmin/importar" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 hover:text-white transition-colors group">
            <Database className="h-4 w-4 text-stone-400 group-hover:text-violet-400 transition-colors" />
            {tNav('import')}
          </Link>
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-stone-800">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="h-4 w-4" /> {tCommon('logout')}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-[#0a0a0a] min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
