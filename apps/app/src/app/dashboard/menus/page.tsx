import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MenuEditorForm } from '@/components/admin/MenuEditorForm'
import { CalendarDays, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'

export default async function MenusPage(props: { searchParams: Promise<{ m?: string, y?: string }> }) {
  const searchParams = await props.searchParams
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

  // Buscar menú de ese mes
  const { data: existingMenu } = await supabase
    .from('dining_menus')
    .select('*')
    .eq('school_id', profile.school_id)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .maybeSingle()

  const t = await getTranslations('dashboardMenus')
  const locale = await getLocale()

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString(locale, { month: 'long' })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-stone-800 tracking-tight flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-teal-600" />
          {t('title')}
        </h2>
        <p className="text-sm text-stone-500 font-medium">
          {t('desc')}
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

      {existingMenu?.file_url && (
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="text-sm font-semibold text-teal-800">
            {t('alreadyUploaded')}
          </div>
          <a href={existingMenu.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-white px-3 py-1.5 rounded-lg border border-teal-200">
            <ExternalLink className="h-3 w-3" />
            {t('viewFile')}
          </a>
        </div>
      )}

      <MenuEditorForm 
        currentMonth={currentMonth} 
        currentYear={currentYear} 
        existingMenu={existingMenu} 
      />
    </div>
  )
}
