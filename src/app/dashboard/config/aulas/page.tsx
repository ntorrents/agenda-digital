import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Building2, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import { DeleteClassroomButton } from '@/components/admin/DeleteClassroomButton'

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

  // Fetch all classrooms with their teacher
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select(`
      id, 
      name, 
      level, 
      capacity,
      teacher_id,
      profiles (
        full_name
      )
    `)
    .eq('school_id', profile.school_id)
    .order('level', { ascending: true })

  // Fetch all staff members to assign as teachers
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('school_id', profile.school_id)
    .in('role', ['teacher', 'admin'])
    .order('full_name', { ascending: true })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" /> Aules del Centre
          </h3>
          <p className="text-xs text-stone-500">Gestió completa, filtres i edició</p>
        </div>
        
        <Link 
          href="/dashboard/config/aulas/nuevo"
          className="inline-flex items-center justify-center rounded-2xl bg-teal-600 text-white hover:bg-teal-700 font-bold text-xs h-9 px-4 shadow-sm transition-all"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Nova Aula
        </Link>
      </div>

      {/* Compact Data Table */}
      <div className="bg-white border border-stone-200/80 rounded-[24px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50/50 text-xs uppercase font-black text-stone-400 border-b border-stone-100">
              <tr>
                <th className="px-4 py-3">Nivell</th>
                <th className="px-4 py-3">Nom Aula</th>
                <th className="px-4 py-3">Capacitat</th>
                <th className="px-4 py-3">Educadora</th>
                <th className="px-4 py-3 text-right">Accions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {classrooms?.map((classroom: any) => (
                <tr key={classroom.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded-md">
                      {classroom.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-stone-900">
                    {classroom.name}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">
                    {classroom.capacity}
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-500">
                    {classroom.profiles ? (Array.isArray(classroom.profiles) ? classroom.profiles[0]?.full_name : classroom.profiles.full_name) : 'Sense educadora'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/dashboard/config/aulas/${classroom.id}`}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-xl transition-colors border border-teal-200/50"
                      >
                        <Eye className="h-3 w-3" /> Editar
                      </Link>
                      <DeleteClassroomButton classroomId={classroom.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {classrooms?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500 text-sm">
                    No hi ha aules creades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
