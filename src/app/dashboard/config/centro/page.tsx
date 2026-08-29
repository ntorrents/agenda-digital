import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SchoolSettingsForm } from '@/components/admin/SchoolSettingsForm'

export default async function DashboardConfigCentroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: school } = await supabase
    .from('profiles')
    .select('schools(*)')
    .eq('id', user.id)
    .single()

  if (!school || !school.schools) redirect('/login')

  const schoolData = Array.isArray(school.schools) ? school.schools[0] : school.schools

  // Fetch stats for active students and active teachers
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolData.id)
    .eq('status', 'active')

  const { count: teacherCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolData.id)
    .in('role', ['teacher', 'admin'])
    .eq('status', 'active')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/config"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-600" /> Paràmetres del Centre
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Configuració general de <strong>{schoolData.name}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Alumnes Actius</p>
          <h3 className="text-2xl font-black text-stone-800 mt-1">{studentCount || 0}</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Equip Actiu</p>
          <h3 className="text-2xl font-black text-stone-800 mt-1">{teacherCount || 0}</h3>
        </div>
      </div>

      <SchoolSettingsForm initialSettings={schoolData.settings || {}} schoolInfo={schoolData} />
    </div>
  )
}
