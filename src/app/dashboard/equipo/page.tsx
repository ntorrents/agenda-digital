import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { EquipoEditor } from './EquipoEditor'

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

  // Fetch only active and paused staff members (exclude inactive/archived)
  const { data: staff } = await supabase
    .from('profiles')
    .select(`
      id, 
      school_id,
      full_name, 
      role, 
      email,
      phone,
      status
    `)
    .eq('school_id', profile.school_id)
    .in('role', ['admin', 'teacher'])
    .neq('status', 'inactive') // Traemos active y paused
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div>
        <h3 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <Users className="h-5 w-5" />
          </div>
          Equip i Personal
        </h3>
        <p className="text-sm text-stone-500 mt-2 max-w-xl">
          Administra els perfils dels educadors, els seus rols i el seu estat actual (actiu o de baixa).
        </p>
      </div>

      <EquipoEditor 
        initialStaff={staff || []} 
        schoolId={profile.school_id} 
      />
    </div>
  )
}
