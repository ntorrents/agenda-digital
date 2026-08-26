'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Building2, Users, Bell, Baby } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string>('Marta Rovira')
  const [schoolName] = useState<string>('Escola Bressol Els Menuts')

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
    { href: '/dashboard/aulas', icon: Building2, label: 'Aules' },
    { href: '/dashboard/personal', icon: Users, label: 'Personal' },
    { href: '/dashboard/avisos', icon: Bell, label: 'Avisos' },
  ]

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 pb-16 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-md shadow-teal-700/20">
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-stone-900 leading-tight">
                {schoolName}
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
        
        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto mt-4">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard' 
                : pathname.startsWith(item.href)
                
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
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  )
}
