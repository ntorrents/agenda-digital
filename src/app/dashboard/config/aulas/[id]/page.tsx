import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'
import { ClassroomDetailForm } from '@/components/admin/ClassroomDetailForm'

export default async function EditClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('school_id', profile.school_id)
    .single()

  if (!classroom) redirect('/dashboard/config/aulas')

  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('school_id', profile.school_id)
    .in('role', ['teacher', 'admin'])
    .order('full_name', { ascending: true })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/config/aulas"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" /> Edició d&apos;Aula
          </h3>
          <p className="text-xs text-stone-500">Editant <strong>{classroom.name}</strong></p>
        </div>
      </div>

      <ClassroomDetailForm teachers={teachers || []} initialData={classroom} />
    </div>
  )
}
