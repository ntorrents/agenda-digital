import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Mail, ShieldAlert, BadgeCheck } from 'lucide-react'
import { StaffFormModal } from '@/components/admin/StaffFormModal'

export default async function DashboardPersonalPage() {
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
    .select('id, full_name, email, role, is_active')
    .eq('school_id', profile.school_id)
    .in('role', ['admin', 'teacher'])
    .order('role', { ascending: true })
    .order('full_name', { ascending: true })

  return (
    <main className="px-4 sm:px-8 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-stone-900">Personal del Centre</h3>
          <p className="text-xs text-stone-400">Directores i Educadores</p>
        </div>
        
        {/* Client Component for the Modal */}
        <StaffFormModal />
      </div>

      <div className="space-y-3">
        {staff?.map(member => (
          <div 
            key={member.id}
            className="flex items-center justify-between rounded-[24px] border border-stone-200/80 bg-white p-4 shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-lg ${member.role === 'admin' ? 'bg-teal-50 text-teal-800' : 'bg-stone-50 text-stone-600'}`}>
                {member.full_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  {member.full_name}
                  {member.role === 'admin' && (
                    <BadgeCheck className="h-3.5 w-3.5 text-teal-600" title="Admin" />
                  )}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                  <Mail className="h-3 w-3" /> {member.email}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${member.role === 'admin' ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-600'}`}>
                {member.role === 'admin' ? 'Directora' : 'Educadora'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
