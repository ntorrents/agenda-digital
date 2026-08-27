import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DailyLogForm } from '@/components/agenda/DailyLogForm'
import { CheckCircle2 } from 'lucide-react'

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

  // Verify the student belongs to the teacher's school/classroom
  const { data: student } = await supabase
    .from('students')
    .select('first_name, last_name')
    .eq('id', studentId)
    .single()

  if (!student) {
    redirect('/mi-aula/alumnos')
  }

  // Fetch existing log for this date if it exists
  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('student_id', studentId)
    .eq('date', dateStr)
    .maybeSingle()

  return (
    <main className="px-4 sm:px-6 pt-4 pb-8 w-full max-w-2xl mx-auto">
      
      {showSuccess && (
        <div className="mb-4 p-4 rounded-[20px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          Agenda desada correctament a la base de dades!
        </div>
      )}

      <DailyLogForm
        studentId={studentId}
        studentName={`${student.first_name} ${student.last_name}`}
        dateStr={dateStr}
        initialData={existingLog || undefined}
      />
    </main>
  )
}
