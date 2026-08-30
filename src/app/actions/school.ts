'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSchoolSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('No profile')
  if (profile.role !== 'admin') throw new Error('Unauthorized. Admin access required.')

  const settingsJsonStr = formData.get('settings') as string
  const cif = formData.get('cif') as string || null
  const contact_email = formData.get('contact_email') as string || null
  const name = formData.get('name') as string
  const address = formData.get('address') as string || null
  const logoFile = formData.get('logo') as File | null
  
  let settings = {}
  
  try {
    settings = JSON.parse(settingsJsonStr)
  } catch (e) {
    throw new Error('Invalid settings JSON format')
  }

  let logoUrl = undefined

  // Upload logo si existe
  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split('.').pop()
    const fileName = `${profile.school_id}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('school-assets')
      .upload(fileName, logoFile, { upsert: true })

    if (uploadError) throw new Error('Error pujant el logotip')

    const { data: { publicUrl } } = supabase.storage
      .from('school-assets')
      .getPublicUrl(fileName)

    logoUrl = publicUrl
  }

  const updateData: any = { settings, cif, contact_email, name, address }
  if (logoUrl) updateData.logo_url = logoUrl

  const { error } = await supabase
    .from('schools')
    .update(updateData)
    .eq('id', profile.school_id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/config/centro')
  revalidatePath('/mi-hijo', 'layout')
  return { success: true }
}
