'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSchoolSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('No profile')

  const settingsJsonStr = formData.get('settings') as string
  const cif = formData.get('cif') as string || null
  const contact_email = formData.get('contact_email') as string || null
  const name = formData.get('name') as string
  const address = formData.get('address') as string || null
  
  let settings = {}
  
  try {
    settings = JSON.parse(settingsJsonStr)
  } catch (e) {
    throw new Error('Invalid settings JSON format')
  }

  const { error } = await supabase
    .from('schools')
    .update({ settings, cif, contact_email, name, address })
    .eq('id', profile.school_id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/config/centro')
  return { success: true }
}
