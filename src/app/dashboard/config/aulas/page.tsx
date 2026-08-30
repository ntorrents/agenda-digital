import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { AulasEditor } from './AulasEditor'
import { getTranslations } from 'next-intl/server'

export default async function DashboardConfigAulasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select(`
      id, 
      name, 
      level, 
      capacity,
      teacher_id,
      auxiliary_teacher_ids,
      status
    `)
    .eq('school_id', profile.school_id)
    .order('level', { ascending: true })

  if (classroomsError) {
    console.error('CLASSROOMS ERROR:', classroomsError)
  }
  console.log('CLASSROOMS RAW:', classrooms)

  // Fetch all staff members to assign as teachers
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('school_id', profile.school_id)
    .in('role', ['teacher', 'admin'])
    .order('full_name', { ascending: true })

  const t = await getTranslations('dashboardAulas')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/config"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-600" /> {t('title')}
            </h3>
            <p className="text-xs text-stone-500">{t('desc')}</p>
          </div>
        </div>
      </div>

      <AulasEditor 
        initialClassrooms={(classrooms || []).filter(c => c.status !== 'inactive')} 
        teachers={teachers || []} 
        schoolId={profile.school_id} 
      />
    </div>
  )
}
