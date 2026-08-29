'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  LogOut, 
  LayoutDashboard, 
  Bell, 
  Baby, 
  Settings, 
  Users, 
  Building2, 
  Utensils, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  Image as ImageIcon,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string>('Marta Rovira')
  const [schoolInfo, setSchoolInfo] = useState<{name: string, logo_url: string | null} | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Mètriques' },
    { href: '/dashboard/config/aulas', icon: Building2, label: 'Aules' },
    { href: '/dashboard/config/alumnos', icon: Baby, label: 'Alumnes' },
    { href: '/dashboard/equipo', icon: Users, label: 'Equip' },
    { href: '/dashboard/menus', icon: Utensils, label: 'Menú Menjador' },
    { href: '/dashboard/comunicacion', icon: MessageSquare, label: 'Comunicació' },
    { href: '/dashboard/calendario', icon: CalendarIcon, label: 'Calendari' },
    { href: '/dashboard/galeria', icon: ImageIcon, label: 'Galeria' },
    { href: '/dashboard/config/centro', icon: Settings, label: 'Ajustes del Centre' },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 flex items-center gap-3 border-b border-stone-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 overflow-hidden shadow-md shadow-teal-700/10 shrink-0">
          {schoolInfo?.logo_url ? (
            <img src={schoolInfo.logo_url} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Baby className="h-5 w-5 text-teal-700" />
          )}
        </div>
        <div className="overflow-hidden">
          <h1 className="text-base font-black text-stone-900 leading-tight truncate">
            {schoolInfo?.name || 'Escola'}
          </h1>
          <p className="text-xs text-stone-500 font-medium">Panell de Direcció</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 no-scrollbar">
        {navItems.map((item) => {
          // Exact match for dashboard to avoid highlighting it when on subroutes
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer group',
                isActive
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-teal-600' : 'text-stone-400 group-hover:text-stone-600')} />
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-stone-800 truncate">{userName}</span>
            <span className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">Directora</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="shrink-0 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer h-9 w-9 transition-colors"
            title="Tancar sessió"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans flex flex-col lg:flex-row">
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 border-r border-stone-200/80 z-20 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 overflow-hidden shrink-0">
            {schoolInfo?.logo_url ? (
              <img src={schoolInfo.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Baby className="h-4 w-4 text-teal-700" />
            )}
          </div>
          <h1 className="text-sm font-black text-stone-900 leading-tight">
            {schoolInfo?.name || 'Escola'}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-stone-600 h-9 w-9 rounded-xl hover:bg-stone-100 cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Drawer (Overlay & Menu) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu */}
          <aside className="relative w-[80%] max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left-full duration-200">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 relative">
        {children}
      </main>
      
    </div>
  )
}
