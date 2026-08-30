import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GlobalNoteForm } from '@/components/aula/GlobalNoteForm'
import { Building2 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function AulaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Find the teacher's classroom
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, school_id')
    .eq('teacher_id', user.id)
    .single()

  const t = await getTranslations('dashboardAula')

  if (!classroom) {
    return (
      <div className="p-8 text-center bg-amber-50 rounded-2xl m-6 max-w-4xl mx-auto">
        <p className="font-bold text-amber-800">{t('noClassroom')}</p>
      </div>
    )
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 border-b border-stone-200 pb-6">
        <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0 border border-teal-100 shadow-sm">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-stone-900">{t('title', { name: classroom.name })}</h2>
          <p className="text-sm font-medium text-stone-500">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulari Global */}
        <div className="bg-white border border-stone-200/80 rounded-[28px] p-6 shadow-sm">
          <h3 className="text-lg font-black text-stone-800 mb-1">{t('cardTitle')}</h3>
          <p className="text-xs font-semibold text-stone-500 mb-6">{t('cardDesc')}</p>
          
          <GlobalNoteForm classroomId={classroom.id} schoolId={classroom.school_id} dateStr={todayStr} />
        </div>

        {/* Informació / Stats */}
        <div className="space-y-4">
          <div className="bg-stone-50 border border-stone-200/80 rounded-[28px] p-6 text-center shadow-sm">
            <h4 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-2">{t('infoTitle')}</h4>
            <p className="text-sm text-stone-500 mb-4 leading-relaxed font-medium">
              {t('infoDesc1')}
            </p>
            <p className="text-sm text-stone-500 leading-relaxed font-medium">
              {t('infoDesc2')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
