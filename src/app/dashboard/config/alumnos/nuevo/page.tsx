import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Baby } from 'lucide-react'
import Link from 'next/link'
import { StudentDetailForm } from '@/components/admin/StudentDetailForm'

export default async function NewStudentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch all classrooms to populate the assignment dropdown
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('id, name, level')
    .eq('school_id', profile.school_id)
    .order('level', { ascending: true })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/config/alumnos"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Baby className="h-5 w-5 text-teal-600" /> Matricular Nou Alumne
          </h3>
          <p className="text-xs text-stone-500">Omple tots els detalls necessaris per a la fitxa</p>
        </div>
      </div>

      <StudentDetailForm classrooms={classrooms || []} />
    </div>
  )
}
