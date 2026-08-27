'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Bell, Baby, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string>('Marta Rovira')
  const [schoolInfo, setSchoolInfo] = useState<{name: string, logo_url: string | null} | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      if (user.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name)
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single()
        
      if (profile?.school_id) {
        const { data: school } = await supabase
          .from('schools')
          .select('name, logo_url')
          .eq('id', profile.school_id)
          .single()
        
        if (school) {
          setSchoolInfo({ name: school.name, logo_url: school.logo_url })
        }
      }
    }
    loadProfile()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Mètriques' },
    { href: '/dashboard/equipo', icon: Users, label: 'Equip' },
    { href: '/dashboard/config/alumnos', icon: Settings, label: 'Configuració' },
    { href: '/dashboard/avisos', icon: Bell, label: 'Avisos' },
  ]

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 pb-20 sm:pb-16 font-sans flex flex-col relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-xs flex flex-col">
        <div className="px-4 sm:px-8 py-3.5 w-full">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 overflow-hidden shadow-md shadow-teal-700/10 shrink-0">
              {schoolInfo?.logo_url ? (
                <img src={schoolInfo.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Baby className="h-5 w-5 text-teal-700" />
              )}
            </div>
            <div>
              <h1 className="text-base font-black text-stone-900 leading-tight">
                {schoolInfo?.name || 'Escola'}
              </h1>
              <p className="text-xs text-stone-500 font-medium">Panell de Direcció</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-stone-800">{userName}</span>
              <span className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">Directora</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-2xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer h-9 w-9"
              title="Tancar sessió"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        </div>
        
        {/* Tab Navigation (Tablet/Desktop only) */}
        <div className="hidden sm:block w-full border-t border-stone-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-2">
            <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              let isActive = false
              if (item.href === '/dashboard') {
                isActive = pathname === '/dashboard'
              } else if (item.href === '/dashboard/config/alumnos') {
                isActive = pathname.startsWith('/dashboard/config')
              } else {
                isActive = pathname.startsWith(item.href)
              }
                
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95',
                    isActive
                      ? 'bg-teal-100 text-teal-900 shadow-sm border border-teal-200/50'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800 border border-transparent'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', isActive ? 'text-teal-600' : '')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-5xl mx-auto">
        {children}
      </div>

      {/* Bottom Tab Navigation (Mobile only) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-200/80 px-2 pb-safe pt-2 flex items-center justify-around">
        {navItems.map((item) => {
          let isActive = false
          if (item.href === '/dashboard') {
            isActive = pathname === '/dashboard'
          } else if (item.href === '/dashboard/config/alumnos') {
            isActive = pathname.startsWith('/dashboard/config')
          } else {
            isActive = pathname.startsWith(item.href)
          }
            
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all cursor-pointer relative',
                isActive 
                  ? 'text-teal-700' 
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              )}
            >
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 rounded-full bg-teal-600" />
              )}
              <div className={cn(
                'flex items-center justify-center rounded-xl p-1.5 transition-all',
                isActive ? 'bg-teal-100/50' : 'bg-transparent'
              )}>
                <item.icon className={cn("h-5 w-5", isActive ? 'animate-in zoom-in duration-300' : '')} />
              </div>
              <span className={cn('text-[9px] font-bold mt-1', isActive ? 'text-teal-800' : '')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
