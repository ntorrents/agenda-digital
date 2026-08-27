import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
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
    .eq('is_active', true)

  const { count: teacherCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolData.id)
    .in('role', ['teacher', 'admin'])
    .eq('is_active', true)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-teal-600" /> Paràmetres del Centre
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Configuració general de <strong>{schoolData.name}</strong>
        </p>
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
