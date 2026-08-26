'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Users, Calendar, Wrench, Baby } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EducatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [teacherName, setTeacherName] = useState<string>('Clara Soler')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setTeacherName(user.user_metadata.full_name)
      }
    }
    loadProfile()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/mi-aula', icon: LayoutDashboard, label: 'Aula' },
    { href: '/mi-aula/alumnos', icon: Users, label: 'Alumnes' },
    { href: '/mi-aula/calendario', icon: Calendar, label: 'Calendari' },
    { href: '/mi-aula/herramientas', icon: Wrench, label: 'Eines' },
  ]

  // Check if we are inside a specific student's log (/mi-aula/alumnos/[id])
  // If so, we might want to hide the tabs to give full focus, or keep them. Let's keep them for easy navigation.

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 pb-10 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-stone-900 leading-tight">
                  Aula Gira-sols
                </h1>
                <span className="bg-orange-50 text-orange-800 border border-orange-200/80 rounded-full text-[10px] font-bold px-2 py-0 hidden sm:inline-flex">
                  I1
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">{teacherName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/mi-hijo')}
              className="rounded-2xl text-xs font-bold text-stone-600 hover:text-stone-900 border-stone-200 hidden sm:inline-flex cursor-pointer h-9"
            >
              Vista Família
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-2xl text-stone-400 hover:text-stone-700 cursor-pointer h-9 w-9"
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
              // Exact match for /mi-aula, startsWith for others
              const isActive = item.href === '/mi-aula' 
                ? pathname === '/mi-aula' 
                : pathname.startsWith(item.href)
                
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95',
                    isActive
                      ? 'bg-orange-100 text-orange-900 shadow-sm border border-orange-200/50'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800 border border-transparent'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', isActive ? 'text-orange-600' : '')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  )
}
