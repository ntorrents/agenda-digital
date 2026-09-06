'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { diningMenuTag } from '@/lib/cache/school-data'
import { logAuditError } from '@/lib/audit-log'
import { revalidatePath, updateTag } from 'next/cache'
import { DOCUMENTS_BUCKET } from '@/lib/storage'
import { sendPushToUsers } from '@/lib/push/send'
import { getGuardianIdsForSchool } from '@/lib/push/recipients'
import { PUSH_COPY, menuBody } from '@/lib/push/copy'

export async function upsertMenu(formData: FormData) {
  let actorId: string | null = null
  let schoolId: string | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    actorId = user.id

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') throw new Error('No autorizado')
    schoolId = profile.school_id

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

      const {
        data: { publicUrl },
      } = admin.storage.from(DOCUMENTS_BUCKET).getPublicUrl(fileName)

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

    const isCreate = !existing

    if (existing) {
      const { error } = await supabase
        .from('dining_menus')
        .update(payload)
        .eq('id', existing.id)
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabase.from('dining_menus').insert([payload])
      if (error) throw new Error(error.message)
    }

    // Push en menú nou o quan s'actualitza (menys freqüent que l'agenda).
    try {
      const guardianIds = await getGuardianIdsForSchool(profile.school_id)
      if (guardianIds.length > 0) {
        await sendPushToUsers(guardianIds, {
          title: isCreate ? PUSH_COPY.menu.titleCreate : PUSH_COPY.menu.titleUpdate,
          body: menuBody(title, month, year),
          url: '/mi-hijo/menus',
          tag: `menu-${profile.school_id}-${year}-${month}`,
        })
      }
    } catch (e) {
      console.warn('[push] menu notify failed', e)
    }

    revalidatePath('/dashboard/menus')
    revalidatePath('/mi-hijo/menus')
    updateTag(diningMenuTag(profile.school_id, year, month))
    return { success: true }
  } catch (e) {
    await logAuditError({
      action: 'error.menu',
      entityType: 'dining_menu',
      error: e,
      actorId,
      schoolId,
    })
    throw e
  }
}
