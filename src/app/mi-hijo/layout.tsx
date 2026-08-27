'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Home, Calendar, Image as ImageIcon, Bell, Menu, X, ArrowLeft, MessageCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [studentName, setStudentName] = useState<string>('Infant')
  const [classroomName, setClassroomName] = useState<string>('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch student info
      const { data: guardianRel } = await supabase
        .from('student_guardians')
        .select('student_id')
        .eq('guardian_id', user.id)
        .limit(1)
        .single()

      if (guardianRel) {
        const { data: student } = await supabase
          .from('students')
          .select('first_name, classrooms(name, level)')
          .eq('id', guardianRel.student_id)
          .single()

        if (student) {
          setStudentName(student.first_name)
          const c = Array.isArray(student.classrooms) ? student.classrooms[0] : student.classrooms
          if (c) setClassroomName(`${c.name} (${c.level})`)
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

  const todayFormatted = new Date().toLocaleDateString('ca-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const isHome = pathname === '/mi-hijo'

  const navItems = [
    { href: '/mi-hijo', icon: Home, label: 'Inici' },
    { href: '/mi-hijo/agenda', icon: Calendar, label: 'Agenda Diària' },
    { href: '/mi-hijo/calendario', icon: Calendar, label: 'Calendari Mensual' },
    { href: '/mi-hijo/mensajes', icon: MessageCircle, label: 'Missatges' },
    { href: '/mi-hijo/galeria', icon: ImageIcon, label: 'Fotos i Galeria' },
    { href: '/mi-hijo/avisos', icon: Bell, label: 'Tauler i Avisos' },
    { href: '/mi-hijo/ayuda', icon: HelpCircle, label: 'Ajuda i Centre' },
  ]

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans flex flex-col relative">
      
      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 flex items-center justify-between border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 font-black text-base shadow-md shadow-amber-400/20">
              {studentName.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-black text-stone-900">{studentName}</h2>
              <p className="text-[10px] font-bold text-stone-500">{classroomName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="rounded-full text-stone-400">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/mi-hijo' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all',
                  isActive 
                    ? 'bg-teal-50 text-teal-800' 
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-teal-600' : 'text-stone-400')} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50 font-bold px-4 py-6"
          >
            <LogOut className="h-5 w-5" />
            Tancar Sessió
          </Button>
        </div>
      </aside>

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-2 py-2 flex items-center justify-between shadow-xs h-16">
        
        <div className="flex items-center gap-1">
          {isHome ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              className="rounded-full text-stone-600 hover:text-stone-900 active:bg-stone-100 h-10 w-10"
            >
              <Menu className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full text-stone-600 hover:text-stone-900 active:bg-stone-100 h-10 w-10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          )}

          {!isHome && (
            <div className="flex items-center gap-2 px-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-sm shadow-amber-400/20">
                {studentName.charAt(0)}
              </div>
              <span className="text-sm font-black text-stone-900">{studentName}</span>
            </div>
          )}
        </div>

        {isHome && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <h1 className="text-[15px] font-black text-stone-900 leading-tight">
              Agenda Digital
            </h1>
            <p className="text-[10px] text-stone-500 font-bold capitalize">{todayFormatted}</p>
          </div>
        )}

        <div className="flex items-center gap-2 pr-2">
          {/* Avatar / Perfil */}
          {isHome && (
            <Link 
              href="/mi-hijo/perfil"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-sm shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {studentName.charAt(0)}
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-lg mx-auto w-full">
        {children}
      </div>

    </div>
  )
}
