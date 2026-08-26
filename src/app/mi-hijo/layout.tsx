'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Home, Calendar, Image as ImageIcon, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [parentName, setParentName] = useState<string>('Jordi Puig')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setParentName(user.user_metadata.full_name)
      }
    }
    loadProfile()
  }, [])

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

  const navItems = [
    { href: '/mi-hijo', icon: Home, label: 'Avui' },
    { href: '/mi-hijo/calendario', icon: Calendar, label: 'Calendari' },
    { href: '/mi-hijo/galeria', icon: ImageIcon, label: 'Galeria' },
    { href: '/mi-hijo/avisos', icon: Bell, label: 'Avisos' },
  ]

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 pb-[80px] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md px-4 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 font-black text-base shadow-md shadow-amber-400/20">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-stone-900 leading-tight">
                Nil Puig
              </h1>
              <span className="bg-teal-50 text-teal-800 border border-teal-200/80 rounded-full text-[10px] font-bold px-2 py-0">
                Gira-sols (I1)
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium capitalize">{todayFormatted}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      </header>

      {/* Main Content Area */}
      <div className="flex-1">
        {children}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 pb-safe shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all active:scale-95 relative cursor-pointer',
                  isActive 
                    ? 'text-teal-700 font-bold' 
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50 font-medium'
                )}
              >
                {isActive && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-teal-600" />
                )}
                <item.icon className={cn('h-5 w-5 mb-1', isActive ? 'text-teal-600' : '')} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
