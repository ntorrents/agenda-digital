'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { DOCUMENTS_BUCKET } from '@/lib/storage'

export async function upsertMenu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') throw new Error('No autorizado')

  const month = parseInt(formData.get('month') as string)
  const year = parseInt(formData.get('year') as string)
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const menuFile = formData.get('file') as File | null

  let file_url: string | undefined

  if (menuFile && menuFile.size > 0) {
    const admin = createAdminClient()
    const fileExt = menuFile.name.split('.').pop() || 'jpg'
    const fileName = `${profile.school_id}/${year}-${month}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await admin.storage
      .from(DOCUMENTS_BUCKET)
      .upload(fileName, menuFile, {
        contentType: menuFile.type || 'application/octet-stream',
        upsert: true,
      })

    if (uploadError) throw new Error('Error pujant el menú: ' + uploadError.message)

    const { data: { publicUrl } } = admin.storage
      .from(DOCUMENTS_BUCKET)
      .getPublicUrl(fileName)

    file_url = publicUrl
  }

  const { data: existing } = await supabase
    .from('dining_menus')
    .select('id, file_url')
    .eq('school_id', profile.school_id)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle()

  const payload: Record<string, unknown> = {
    school_id: profile.school_id,
    month,
    year,
    title,
    description,
  }
  if (file_url) {
    payload.file_url = file_url
  }

  if (existing) {
    const { error } = await supabase
      .from('dining_menus')
      .update(payload)
      .eq('id', existing.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('dining_menus')
      .insert([payload])
    if (error) throw new Error(error.message)
  }

  revalidatePath('/dashboard/menus')
  revalidatePath('/mi-hijo/menus')
  return { success: true }
}
