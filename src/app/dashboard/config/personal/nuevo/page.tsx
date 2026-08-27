import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { StaffDetailForm } from '@/components/admin/StaffDetailForm'

export default async function NewStaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

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
            <UserPlus className="h-5 w-5 text-teal-600" /> Nou Personal
          </h3>
          <p className="text-xs text-stone-500">Crea un compte per a una nova educadora o directora</p>
        </div>
      </div>

      <StaffDetailForm />
    </div>
  )
}
