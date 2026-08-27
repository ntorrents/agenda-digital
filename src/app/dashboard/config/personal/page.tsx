import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Plus, Eye, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardConfigPersonalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch all staff
  const { data: staff } = await supabase
    .from('profiles')
    .select(`
      id, 
      full_name, 
      email, 
      role, 
      is_active,
      created_at
    `)
    .eq('school_id', profile.school_id)
    .in('role', ['admin', 'teacher'])
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" /> Personal del Centre
          </h3>
          <p className="text-xs text-stone-500">Gestió, rols i assistència diària</p>
        </div>
        
        <Link 
          href="/dashboard/config/personal/nuevo"
          className="inline-flex items-center justify-center rounded-2xl bg-teal-600 text-white hover:bg-teal-700 font-bold text-xs h-9 px-4 shadow-sm transition-all"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Nou Membre
        </Link>
      </div>

      {/* Compact Data Table */}
      <div className="bg-white border border-stone-200/80 rounded-[24px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50/50 text-xs uppercase font-black text-stone-400 border-b border-stone-100">
              <tr>
                <th className="px-4 py-3">Nom Complet</th>
                <th className="px-4 py-3">Correu</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estat Actiu</th>
                <th className="px-4 py-3 text-right">Accions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staff?.map((member: any) => {
                return (
                  <tr key={member.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-stone-900 flex items-center gap-2 whitespace-nowrap">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs ${member.role === 'admin' ? 'bg-teal-50 text-teal-800' : 'bg-stone-100 text-stone-600'}`}>
                        {member.full_name.charAt(0)}
                      </div>
                      {member.full_name}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {member.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${member.role === 'admin' ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-600'}`}>
                        {member.role === 'admin' ? 'Directora' : 'Educadora'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {member.is_active ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">Actiu</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">De baixa</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/config/personal/${member.id}`}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-xl transition-colors border border-teal-200/50"
                        >
                          <Eye className="h-3 w-3" /> Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
