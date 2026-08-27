'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Users, Calendar, Wrench, Baby } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateSelector } from '@/components/shared/DateSelector'

export default function EducatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [teacherName, setTeacherName] = useState<string>('Carregant...')
  const [classroomName, setClassroomName] = useState<string>('Aula')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setTeacherName(user.user_metadata.full_name)
      }
      if (user) {
        const { data: classroom } = await supabase
          .from('classrooms')
          .select('name')
          .eq('teacher_id', user.id)
          .single()
        if (classroom) {
          setClassroomName(`Aula ${classroom.name}`)
        }
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

  // Para ocultar la tab bar inferior en ciertas subrutas donde queramos pantalla completa
  // (Por ejemplo en el detalle de alumno)
  const isStudentDetail = pathname.match(/\/mi-aula\/alumnos\/[a-zA-Z0-9-]{36}/)

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 pb-20 sm:pb-10 font-sans flex flex-col relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-xs flex flex-col">
        <div className="px-4 sm:px-6 py-3.5 w-full">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                <Baby className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-stone-900 leading-tight">
                  {classroomName}
                </h1>
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
        </div>

        {/* Global Date Selector (always visible in header) */}
        {!isStudentDetail && (
           <div className="w-full bg-white/50 border-t border-stone-100">
             <div className="max-w-5xl mx-auto">
                <DateSelector className="py-1" />
             </div>
           </div>
        )}
        
        {/* Tab Navigation (Tablet/Desktop only) */}
        <div className="hidden sm:block w-full border-t border-stone-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
            <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
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
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto">
        {children}
      </div>

      {/* Bottom Tab Navigation (Mobile only) */}
      {!isStudentDetail && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-200/80 px-2 pb-safe pt-2 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = item.href === '/mi-aula' 
              ? pathname === '/mi-aula' 
              : pathname.startsWith(item.href)
              
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all cursor-pointer relative',
                  isActive 
                    ? 'text-orange-600' 
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                )}
              >
                {isActive && (
                  <span className="absolute -top-1 w-8 h-1 rounded-full bg-orange-500" />
                )}
                <div className={cn(
                  'flex items-center justify-center rounded-xl p-1.5 transition-all',
                  isActive ? 'bg-orange-100' : 'bg-transparent'
                )}>
                  <item.icon className={cn("h-5 w-5", isActive ? 'animate-in zoom-in duration-300' : '')} />
                </div>
                <span className={cn('text-[9px] font-bold mt-1', isActive ? 'text-orange-700' : '')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
