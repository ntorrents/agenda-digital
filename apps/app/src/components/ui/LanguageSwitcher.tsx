'use client'

import { useTransition, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setLocaleAction } from '@/app/actions/locale'
import { Locale } from '@/i18n'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'ca', name: 'Català' },
  { code: 'es', name: 'Castellano' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
]

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  
  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = () => setIsOpen(false)
    if (isOpen) {
      document.addEventListener('click', handleClick)
    }
    return () => document.removeEventListener('click', handleClick)
  }, [isOpen])

  const handleLanguageChange = (locale: Locale) => {
    if (locale === currentLocale) return
    startTransition(async () => {
      await setLocaleAction(locale)
      router.refresh()
    })
  }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-white border border-stone-200 shadow-sm hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors focus:outline-none"
        title="Canviar idioma"
      >
        <Globe className={cn("h-5 w-5", isPending && "animate-spin opacity-50")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-stone-200 shadow-lg rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                handleLanguageChange(lang.code as Locale)
                setIsOpen(false)
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm font-medium rounded-xl transition-colors",
                currentLocale === lang.code 
                  ? "bg-teal-50 text-teal-700 font-bold" 
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
