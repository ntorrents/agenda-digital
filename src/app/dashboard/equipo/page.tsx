import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Activity } from 'lucide-react'
import { StaffAttendanceButtons } from '@/components/admin/StaffAttendanceButtons'

export default async function DashboardEquipoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  // Fetch all staff and their attendance today
  const { data: staff } = await supabase
    .from('profiles')
    .select(`
      id, 
      full_name, 
      role, 
      is_active,
      staff_attendance (
        status,
        date
      )
    `)
    .eq('school_id', profile.school_id)
    .in('role', ['admin', 'teacher'])
    .eq('is_active', true)
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  return (
    <div className="px-4 sm:px-8 pt-6 pb-20 space-y-6">
      
      <div>
        <h3 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <Users className="h-5 w-5" />
          </div>
          Equip i Assistència
        </h3>
        <p className="text-sm text-stone-500 mt-2 max-w-xl">
          Marca fàcilment l&apos;assistència, absències o baixes mèdiques del teu equip per al dia d&apos;avui ({new Date().toLocaleDateString('ca-ES')}).
        </p>
      </div>

      <div className="bg-white border border-stone-200/80 rounded-[28px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600 min-w-[600px]">
            <thead className="bg-stone-50/50 text-xs uppercase font-black text-stone-400 border-b border-stone-100">
              <tr>
                <th className="px-4 py-4">Membre de l&apos;Equip</th>
                <th className="px-4 py-4">Rol</th>
                <th className="px-4 py-4 text-center">Assistència Avui</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staff?.map((member: any) => {
                // Find today's attendance record if any
                const todayRecord = member.staff_attendance?.find((a: any) => a.date === today)
                const currentStatus = todayRecord ? todayRecord.status : null

                return (
                  <tr key={member.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-stone-900 flex items-center gap-3 whitespace-nowrap">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] text-sm font-black ${member.role === 'admin' ? 'bg-teal-50 text-teal-800' : 'bg-stone-100 text-stone-600'}`}>
                        {member.full_name.charAt(0)}
                      </div>
                      {member.full_name}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${member.role === 'admin' ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-600'}`}>
                        {member.role === 'admin' ? 'Directora' : 'Educadora'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <StaffAttendanceButtons staffId={member.id} currentStatus={currentStatus} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {staff?.length === 0 && (
            <div className="p-8 text-center text-stone-500 text-sm">
              No hi ha personal actiu per mostrar.
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}
