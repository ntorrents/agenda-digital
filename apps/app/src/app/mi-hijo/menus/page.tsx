import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarDays, ExternalLink, Download } from 'lucide-react'
import Link from 'next/link'

export default async function MenusViewPage(props: { searchParams: Promise<{ m?: string, y?: string }> }) {
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

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('ca', { month: 'long' })

  return (
    <div className="space-y-6 pt-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-stone-800 tracking-tight flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-teal-600" />
          Menú Comedor
        </h2>
        <p className="text-sm text-stone-500 font-medium">
          Consulta el menú mensual preparat pel centre.
        </p>
      </div>

      <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <span className="font-bold text-stone-800 capitalize">
          {monthName} {currentYear}
        </span>
        <div className="flex gap-2">
          <Link replace={true} href={`?m=${currentMonth === 1 ? 12 : currentMonth - 1}&y=${currentMonth === 1 ? currentYear - 1 : currentYear}`} className="px-3 py-1.5 text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-lg">Anterior</Link>
          <Link replace={true} href={`?m=${today.getMonth() + 1}&y=${today.getFullYear()}`} className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg">Mes Actual</Link>
          <Link replace={true} href={`?m=${currentMonth === 12 ? 1 : currentMonth + 1}&y=${currentMonth === 12 ? currentYear + 1 : currentYear}`} className="px-3 py-1.5 text-xs font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-lg">Següent</Link>
        </div>
      </div>

      {!existingMenu ? (
        <div className="bg-stone-50 border border-stone-200 p-8 rounded-[28px] text-center space-y-3">
          <CalendarDays className="h-10 w-10 text-stone-300 mx-auto" />
          <div>
            <h3 className="font-bold text-stone-700">Encara no hi ha cap menú</h3>
            <p className="text-sm text-stone-500">L'escola no ha publicat cap menú per aquest mes.</p>
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
              {existingMenu.file_url.endsWith('.pdf') ? (
                <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-semibold text-teal-800">Menú complet en PDF</span>
                  <a href={existingMenu.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl transition-colors">
                    <Download className="h-4 w-4" />
                    Descarregar
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-50">
                  <img src={existingMenu.file_url} alt="Menú del mes" className="w-full object-contain max-h-[80vh]" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
