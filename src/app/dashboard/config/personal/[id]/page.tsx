import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { StaffDetailForm } from '@/components/admin/StaffDetailForm'

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: staffMember } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('school_id', profile.school_id)
    .single()

  if (!staffMember) redirect('/dashboard/config/personal')

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/config/personal"
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <User className="h-5 w-5 text-teal-600" /> Editar Perfil
          </h3>
          <p className="text-xs text-stone-500">Editant els dades de <strong>{staffMember.full_name}</strong></p>
        </div>
      </div>

      <StaffDetailForm initialData={staffMember} />
    </div>
  )
}
