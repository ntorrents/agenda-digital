import { createClient } from '@/lib/supabase/server'
import { getCachedSchoolSettings } from '@/lib/cache/school-data'
import { redirect } from 'next/navigation'
import { DailyLogForm } from '@/components/agenda/DailyLogForm'
import { CheckCircle2 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function StudentLogPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ date?: string, success?: string }> }) {
  const params = await props.params
  const searchParams = await props.searchParams
  
  const studentId = params.id
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0]
  const showSuccess = searchParams.success === 'true'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  const schoolId = profile?.school_id

  // Verify the student belongs to the teacher's school/classroom
  const { data: student } = await supabase
    .from('students')
    .select('first_name, last_name, school_id, classroom_id')
    .eq('id', studentId)
    .single()

  if (!student || !schoolId || student.school_id !== schoolId || !student.classroom_id) {
    redirect('/dashboard/agendas')
  }

  const settings = await getCachedSchoolSettings(schoolId)

  // Fetch existing log for this date if it exists
  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('student_id', studentId)
    .eq('date', dateStr)
    .maybeSingle()

  // Fetch guardians
  const { data: guardiansData } = await supabase
    .from('student_guardians')
    .select(`
      relation,
      profiles (
        full_name,
        phone,
        email
      )
    `)
    .eq('student_id', studentId)

  const t = await getTranslations('dashboardAgendas')

  return (
    <main className="px-4 sm:px-6 pt-4 pb-8 w-full max-w-2xl mx-auto space-y-6">
      {guardiansData && guardiansData.length > 0 && (
        <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs">
          <h3 className="text-[11px] font-black uppercase text-stone-400 tracking-wider mb-4">{t('guardianTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guardiansData.map((g: any, i: number) => {
              const prof = Array.isArray(g.profiles) ? g.profiles[0] : g.profiles
              if (!prof) return null
              return (
                <div key={i} className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-stone-800">{prof.full_name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200/50 px-2 py-0.5 rounded-lg">{g.relation}</span>
                  </div>
                  {prof.phone && (
                    <a href={`tel:${prof.phone}`} className="text-xs font-semibold text-teal-600 block mt-2 hover:underline">
                      📞 {prof.phone}
                    </a>
                  )}
                  {prof.email && (
                    <a href={`mailto:${prof.email}`} className="text-xs font-semibold text-stone-500 block mt-1 hover:underline truncate">
                      ✉️ {prof.email}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="mb-4 p-4 rounded-[20px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          {t('successMsg')}
        </div>
      )}

      <DailyLogForm
        studentId={studentId}
        studentName={`${student.first_name} ${student.last_name}`}
        dateStr={dateStr}
        classroomId={student.classroom_id}
        initialData={existingLog || undefined}
        settings={settings}
      />
    </main>
  )
}
