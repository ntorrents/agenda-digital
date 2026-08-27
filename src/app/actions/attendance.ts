'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setStaffAttendance(staffId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('No profile')

  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('staff_attendance')
    .select('id')
    .eq('staff_id', staffId)
    .eq('date', today)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('staff_attendance')
      .update({ status })
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('staff_attendance')
      .insert([{
        school_id: profile.school_id,
        staff_id: staffId,
        date: today,
        status
      }])
    if (error) throw new Error(error.message)
  }

  revalidatePath('/dashboard/config/personal')
  return { success: true }
}
