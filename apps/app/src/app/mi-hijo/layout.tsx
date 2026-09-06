'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Home, Calendar, Image as ImageIcon, Bell, Menu, X, ArrowLeft, MessageCircle, HelpCircle, Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { DatePickerNav } from '@/components/ui/DatePickerNav'
import { PetitDiariLoader } from '@/components/ui/PetitDiariLoader'
import { FamilyStudentProvider, useFamilyStudent } from '@/components/family/FamilyStudentProvider'
import { StudentSwitcher } from '@/components/family/StudentSwitcher'
import { PetitDiariBrandAvatar } from '@/components/brand/PetitDiariBrand'
import { PetitDiariBrandMark } from '@/components/brand/PetitDiariBrandFooter'

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
          <PetitDiariLoader fullScreen />
        </div>
      }
    >
      <FamilyStudentProvider>
        <FamilyLayoutShell>{children}</FamilyLayoutShell>
      </FamilyStudentProvider>
    </Suspense>
  )
}

function FamilyLayoutShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tNav = useTranslations('navigation')
  const tCommon = useTranslations('common')
  const tLayout = useTranslations('familyLayout')
  const locale = useLocale()
  const { displayName, classroomName, activeStudentId, hasMultiple } = useFamilyStudent()
  const [schoolInfo, setSchoolInfo] = useState<{ name: string; logo_url: string | null } | null>(null)
  const [guardianName, setGuardianName] = useState(() => tLayout('defaultGuardian'))
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const currentDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const dateLocaleMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    en: 'en-GB',
    fr: 'fr-FR',
  }
  const dateLocale = dateLocaleMap[locale] || 'ca-ES'
  const todayRaw = new Date().toLocaleDateString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const todayFormatted = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('force_password_reset, school_id, full_name')
        .eq('id', user.id)
        .single()

      if (profile?.force_password_reset) {
        router.push('/force-password-reset')
        return
      }

      if (profile?.full_name?.trim()) {
        setGuardianName(profile.full_name.trim())
      }

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
      setIsReady(true)
    }
    loadProfile()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isHome = pathname === '/mi-hijo'

  const hideDatePicker =
    isHome ||
    pathname.startsWith('/mi-hijo/perfil') ||
    pathname.startsWith('/mi-hijo/ayuda') ||
    pathname.startsWith('/mi-hijo/menus')
  const showDatePicker = !hideDatePicker

  const getBackHref = (path: string): string => {
    if (path === '/mi-hijo' || path === '/mi-hijo/') return '/mi-hijo'
    return '/mi-hijo'
  }

  const handleBack = () => {
    window.scrollTo(0, 0)
    router.push(getBackHref(pathname))
  }

  const withStudent = (base: string) => {
    if (!activeStudentId) return base
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}student=${activeStudentId}`
  }

  const navItems = [
    { href: '/mi-hijo', icon: Home, label: tNav('home') },
    { href: '/mi-hijo/agenda', icon: Calendar, label: tNav('dailyAgenda') },
    { href: '/mi-hijo/calendario', icon: Calendar, label: tNav('monthlyCalendar') },
    { href: '/mi-hijo/menus', icon: Utensils, label: tNav('menu') },
    { href: '/mi-hijo/mensajes', icon: MessageCircle, label: tNav('messages') },
    { href: '/mi-hijo/galeria', icon: ImageIcon, label: tNav('photos') },
    { href: '/mi-hijo/avisos', icon: Bell, label: tNav('notices') },
    { href: '/mi-hijo/ayuda', icon: HelpCircle, label: tNav('help') },
  ]

  useEffect(() => {
    setIsMenuOpen(false)
    // Layout compartit: el scroll de la finestra es manté entre rutes i deixa la home tallada.
    window.scrollTo(0, 0)
  }, [pathname])

  const schoolBrand = schoolInfo?.logo_url ? (
    <img
      src={schoolInfo.logo_url}
      alt={schoolInfo.name || 'Logo escola'}
      className="h-10 lg:h-10 w-auto max-w-full object-contain"
    />
  ) : (
    <span className="text-sm lg:text-base font-black text-stone-900 truncate max-w-full">
      {schoolInfo?.name || 'Petit Diari'}
    </span>
  )

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <PetitDiariLoader message={tCommon('loading')} fullScreen />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans flex flex-col relative lg:pl-72">
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col lg:translate-x-0',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b border-stone-100 flex flex-col gap-4 relative">
          <div className="flex items-center gap-3">
            <PetitDiariBrandAvatar size="sidebar" className="shadow-lg shadow-[#0f766e]/10 border-teal-100" />
            <div className="overflow-hidden min-w-0 flex-1 pr-8">
              <h1 className="text-xl font-black text-stone-800 tracking-tight truncate">{guardianName}</h1>
              <p className="text-sm font-bold text-[#0f766e] truncate">
                {schoolInfo?.name || 'Petit Diari'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(false)}
            className="lg:hidden absolute top-4 right-4 rounded-full text-stone-400"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/mi-hijo' && pathname.startsWith(item.href))
            const href =
              item.href === '/mi-hijo'
                ? withStudent(item.href)
                : withStudent(`${item.href}?date=${currentDate}`)
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all',
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                )}
              >
                <item.icon
                  className={cn('h-5 w-5', isActive ? 'text-teal-600' : 'text-stone-400')}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 bg-stone-50/50 mt-auto space-y-3">
          <div className="flex justify-center">
            <PetitDiariBrandMark />
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 font-bold transition-all"
          >
            <LogOut className="h-4 w-4" /> {tCommon('logout')}
          </button>
        </div>
      </aside>

      <header
        className={cn(
          'sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-xs overflow-visible lg:hidden',
          showDatePicker && !isHome ? 'px-2 pt-2 pb-3' : 'px-3 py-3 min-h-[72px]'
        )}
      >
        {isHome ? (
          <>
            <div className="relative flex items-center justify-between min-h-10 gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="rounded-full text-stone-600 hover:text-stone-900 active:bg-stone-100 h-10 w-10 shrink-0"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none max-w-[55%]">
                {schoolBrand}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href={withStudent('/mi-hijo/perfil')}
                  className="block shrink-0 hover:scale-105 active:scale-95 transition-all"
                >
                  <PetitDiariBrandAvatar size="xs" />
                </Link>
              </div>
            </div>
            <p className="text-center text-sm text-stone-600 font-bold capitalize mt-2 tracking-wide">
              {todayFormatted}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 min-h-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="rounded-full text-stone-600 hover:text-stone-900 active:bg-stone-100 h-10 w-10 shrink-0"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-sm shadow-amber-400/20">
                  {displayName.charAt(0)}
                </div>
                <span className="text-sm font-black text-stone-900 truncate">{displayName}</span>
                {hasMultiple && <StudentSwitcher variant="compact" />}
              </div>
              <div className="shrink-0 pl-2 max-w-[42%]">{schoolBrand}</div>
            </div>
            {showDatePicker && (
              <div className="mt-2.5 mb-1 flex justify-center px-1">
                <DatePickerNav
                  currentDate={currentDate}
                  variant="compact"
                  replace
                  className="w-full max-w-[280px]"
                />
              </div>
            )}
          </>
        )}
      </header>

      <header className="hidden lg:flex sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-6 py-3 items-center justify-between shadow-xs min-h-16 overflow-visible gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {!isHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 h-10 w-10 shrink-0"
              title={tLayout('backToMenu')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {isHome && schoolInfo?.logo_url && (
            <img
              src={schoolInfo.logo_url}
              alt={schoolInfo.name || 'Logo escola'}
              className="h-11 w-auto max-w-[140px] object-contain shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-black text-stone-900 truncate">
              {isHome ? schoolInfo?.name || 'Petit Diari' : displayName}
            </h1>
            <p className="text-sm text-stone-500 font-medium capitalize truncate">
              {isHome ? todayFormatted : classroomName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hasMultiple && !isHome && (
            <div className="w-[200px]">
              <StudentSwitcher variant="compact" />
            </div>
          )}
          {showDatePicker ? (
            <DatePickerNav currentDate={currentDate} variant="compact" replace />
          ) : (
            <Link
              href={withStudent('/mi-hijo/perfil')}
              className="block shrink-0 hover:scale-105 transition-all"
            >
              <PetitDiariBrandAvatar size="sm" />
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 pb-10">{children}</div>
    </div>
  )
}
