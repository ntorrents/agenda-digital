'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Home, Calendar, Image as ImageIcon, Bell, Menu, X, ArrowLeft, MessageCircle, HelpCircle, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { Locale } from '@/i18n'

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const tNav = useTranslations('navigation')
  const tCommon = useTranslations('common')
  const locale = useLocale() as Locale
  const [studentName, setStudentName] = useState<string>('Infant')
  const [classroomName, setClassroomName] = useState<string>('')
  const [schoolInfo, setSchoolInfo] = useState<{name: string, logo_url: string | null} | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const searchParams = useSearchParams()
  const currentDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    if (newDate) {
      router.push(`${pathname}?date=${newDate}`)
    }
  }

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

        // Fetch school info for the header
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
    { href: '/mi-hijo', icon: Home, label: tNav('home') },
    { href: '/mi-hijo/agenda', icon: Calendar, label: tNav('dailyAgenda') },
    { href: '/mi-hijo/calendario', icon: Calendar, label: tNav('monthlyCalendar') },
    { href: '/mi-hijo/menus', icon: Utensils, label: tNav('menu') },
    { href: '/mi-hijo/mensajes', icon: MessageCircle, label: tNav('messages') },
    { href: '/mi-hijo/galeria', icon: ImageIcon, label: tNav('photos') },
    { href: '/mi-hijo/avisos', icon: Bell, label: tNav('notices') },
    { href: '#', icon: HelpCircle, label: tNav('help') },
  ]

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans flex flex-col relative lg:pl-72">
      
      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Desktop/Mobile Sidebar */}
      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col lg:translate-x-0",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* User Info Header */}
        <div className="p-6 border-b border-stone-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-[1.2rem] bg-[#0f766e] flex items-center justify-center shadow-lg shadow-[#0f766e]/20 shrink-0">
              <span className="text-lg font-black text-white">{studentName.charAt(0)}</span>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl font-black text-stone-800 tracking-tight truncate">{studentName}</h1>
              <p className="text-sm font-bold text-[#0f766e] truncate">{classroomName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="lg:hidden absolute top-4 right-4 rounded-full text-stone-400">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/mi-hijo' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href === '/mi-hijo' ? item.href : `${item.href}?date=${currentDate}`}
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

        {/* Logout */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 mt-auto">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 font-bold transition-all"
          >
            <LogOut className="h-4 w-4" /> {tCommon('logout')}
          </button>
        </div>
      </aside>

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-2 py-2 flex items-center justify-between shadow-xs h-16 lg:hidden">
        
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

        {isHome ? (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col">
            {schoolInfo?.logo_url ? (
              <img src={schoolInfo.logo_url} alt="Logo escola" className="h-6 w-auto object-contain mb-0.5" />
            ) : (
              <h1 className="text-[15px] font-black text-stone-900 leading-tight">
                {schoolInfo?.name || 'Agenda Digital'}
              </h1>
            )}
            <p className="text-[10px] text-stone-500 font-bold capitalize">{todayFormatted}</p>
          </div>
        ) : (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <input 
              type="date" 
              value={currentDate}
              onChange={handleDateChange}
              className="bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
            />
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
