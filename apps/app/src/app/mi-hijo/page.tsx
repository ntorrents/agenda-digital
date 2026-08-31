import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MessageCircle, Image as ImageIcon, Bell, HelpCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { HomeStudentPicker } from '@/components/family/HomeStudentPicker'

export default async function FamilyAppHome() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const t = await getTranslations('familyHome')
  const today = new Date().toISOString().split('T')[0]
  const withDate = (path: string) => `${path}?date=${today}`

  return (
    <main className="px-5 pt-8 pb-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t('title')}</h2>
          <p className="text-sm font-medium text-stone-500">{t('subtitle')}</p>
        </div>

        <HomeStudentPicker />

        <div className="grid grid-cols-2 gap-4">
          <Link
            href={withDate('/mi-hijo/agenda')}
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Calendar className="h-8 w-8 text-rose-500" />
            </div>
            <span className="text-sm font-black text-stone-700">{t('agenda')}</span>
          </Link>

          <Link
            href={withDate('/mi-hijo/mensajes')}
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-cyan-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <MessageCircle className="h-8 w-8 text-cyan-500" />
            </div>
            <span className="text-sm font-black text-stone-700">{t('messages')}</span>
          </Link>

          <Link
            href={withDate('/mi-hijo/galeria')}
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <ImageIcon className="h-8 w-8 text-emerald-500" />
            </div>
            <span className="text-sm font-black text-stone-700">{t('photos')}</span>
          </Link>

          <Link
            href={withDate('/mi-hijo/avisos')}
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Bell className="h-8 w-8 text-amber-500" />
            </div>
            <span className="text-sm font-black text-stone-700">{t('notices')}</span>
          </Link>

          <Link
            href={withDate('/mi-hijo/calendario')}
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <span className="text-sm font-black text-stone-700">{t('calendar')}</span>
          </Link>

          <Link
            href="/mi-hijo/ayuda"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] bg-white border border-stone-200/60 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <div className="h-16 w-16 rounded-[20px] bg-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <HelpCircle className="h-8 w-8 text-blue-500" />
            </div>
            <span className="text-sm font-black text-stone-700">{t('help')}</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
