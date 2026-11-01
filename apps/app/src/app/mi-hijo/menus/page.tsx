import { createClient } from '@/lib/supabase/server'
import { getCachedDiningMenu } from '@/lib/cache/school-data'
import { redirect } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { MenuFilePreview } from '@/components/family/MenuFilePreview'

export default async function MenusViewPage(props: { searchParams: Promise<{ m?: string, y?: string }> }) {
  const searchParams = await props.searchParams
  const t = await getTranslations('familyMenus')
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()
    
  if (!profile) redirect('/login')

  const today = new Date()
  const currentMonth = searchParams.m ? parseInt(searchParams.m) : today.getMonth() + 1
  const currentYear = searchParams.y ? parseInt(searchParams.y) : today.getFullYear()

  const existingMenu = await getCachedDiningMenu(
    profile.school_id,
    currentYear,
    currentMonth
  )

  const dateLocaleMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    en: 'en-GB',
    fr: 'fr-FR',
  }
  const dateLocale = dateLocaleMap[locale] || 'ca-ES'
  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString(dateLocale, { month: 'long' })

  return (
    <div className="space-y-6 pt-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-stone-800 tracking-tight flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-teal-600" />
          {t('title')}
        </h2>
        <p className="text-sm text-stone-500 font-medium">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <span className="font-bold text-stone-800 capitalize">
          {monthName} {currentYear}
        </span>
        <div className="flex gap-2">
          <Link replace={true} href={`?m=${currentMonth === 1 ? 12 : currentMonth - 1}&y=${currentMonth === 1 ? currentYear - 1 : currentYear}`} className="px-3 py-1.5 text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-lg">{t('prev')}</Link>
          <Link replace={true} href={`?m=${today.getMonth() + 1}&y=${today.getFullYear()}`} className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg">{t('current')}</Link>
          <Link replace={true} href={`?m=${currentMonth === 12 ? 1 : currentMonth + 1}&y=${currentMonth === 12 ? currentYear + 1 : currentYear}`} className="px-3 py-1.5 text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-lg">{t('next')}</Link>
        </div>
      </div>

      {!existingMenu ? (
        <div className="bg-stone-50 border border-stone-200 p-8 rounded-[28px] text-center space-y-3">
          <CalendarDays className="h-10 w-10 text-stone-300 mx-auto" />
          <div>
            <h3 className="font-bold text-stone-700">{t('emptyTitle')}</h3>
            <p className="text-sm text-stone-500">{t('emptyDesc')}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-[28px] p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-stone-800">{existingMenu.title}</h3>
            {existingMenu.description && (
              <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{existingMenu.description}</p>
            )}
          </div>
          
          {existingMenu.file_url && (
            <div className="pt-4 border-t border-stone-100">
              <MenuFilePreview fileUrl={existingMenu.file_url} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
