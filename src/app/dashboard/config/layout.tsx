'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Baby, Building2, Users, Settings } from 'lucide-react'

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard/config/alumnos', icon: Baby, label: 'Alumnes' },
    { href: '/dashboard/config/aulas', icon: Building2, label: 'Aules' },
    { href: '/dashboard/config/personal', icon: Users, label: 'Personal' },
    { href: '/dashboard/config/centro', icon: Settings, label: 'Centre' },
  ]

  return (
    <div className="flex flex-col space-y-4">
      {/* Sub-navigation for Config */}
      <div className="px-4 sm:px-8 pt-4">
        <h2 className="text-xl font-black text-stone-900 mb-4">Configuració General</h2>
        <div className="bg-white p-2 rounded-2xl border border-stone-200/80 shadow-xs flex overflow-x-auto no-scrollbar gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex-1 justify-center sm:flex-none sm:justify-start',
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                )}
              >
                <item.icon className={cn('h-4 w-4', isActive ? 'text-stone-300' : '')} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-8 pb-8">
        {children}
      </div>
    </div>
  )
}
