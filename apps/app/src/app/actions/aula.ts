'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { assertClassroomAccess } from '@/lib/teacher-classroom'
import { DASHBOARD_STAFF_ROLES } from '@/lib/roles'
import { PHOTOS_BUCKET } from '@/lib/storage'
import { logAudit } from '@/lib/audit-log'

export async function saveGlobalNoteAndPhoto(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticat' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !(DASHBOARD_STAFF_ROLES as readonly string[]).includes(profile.role)) {
    return { success: false, error: 'No autoritzat' }
  }

  const classroomId = formData.get('classroomId') as string
  const schoolId = formData.get('schoolId') as string
  const dateStr = formData.get('dateStr') as string
  const note = (formData.get('note') as string) || ''
  const file = formData.get('file') as File | null

  if (!classroomId || !schoolId || !dateStr) {
    return { success: false, error: 'Dades incompletes' }
  }

  if (!note.trim() && !(file instanceof File && file.size > 0)) {
    return { success: false, error: 'Afegeix una nota o una foto' }
  }

  try {
    await assertClassroomAccess(supabase, user.id, profile.role, classroomId)

    let photoUrl: string | null = null

    if (file instanceof File && file.size > 0) {
      const admin = createAdminClient()
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${schoolId}/classrooms/${classroomId}/${dateStr}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await admin.storage
        .from(PHOTOS_BUCKET)
        .upload(fileName, file, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        return { success: false, error: "Error pujant la imatge: " + uploadError.message }
      }

      const { data: publicUrlData } = admin.storage.from(PHOTOS_BUCKET).getPublicUrl(fileName)
      photoUrl = publicUrlData.publicUrl
    }

    const admin = createAdminClient()

    const { data: existingGlobal } = await admin
      .from('classroom_daily_notes')
      .select('id, note, photo_url')
      .eq('classroom_id', classroomId)
      .eq('date', dateStr)
      .maybeSingle()

    const payload = {
      school_id: schoolId,
      classroom_id: classroomId,
      teacher_id: user.id,
      date: dateStr,
      note: note.trim() || existingGlobal?.note || null,
      photo_url: photoUrl || existingGlobal?.photo_url || null,
    }

    if (existingGlobal) {
      const { error } = await admin
        .from('classroom_daily_notes')
        .update(payload)
        .eq('id', existingGlobal.id)

      if (error) return { success: false, error: error.message }
    } else {
      const { error } = await admin
        .from('classroom_daily_notes')
        .insert(payload)

      if (error) return { success: false, error: error.message }
    }

    await logAudit({
      actorId: user.id,
      action: 'classroom_note.save',
      entityType: 'classroom_daily_notes',
      entityId: existingGlobal?.id || classroomId,
      schoolId,
      payload: { classroomId, date: dateStr, hasPhoto: !!photoUrl },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/agendas')
    revalidatePath('/mi-hijo/agenda')
    revalidatePath('/mi-hijo/galeria')

    return { success: true }
  } catch (error: unknown) {
    console.error('saveGlobalNoteAndPhoto error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconegut',
    }
  }
}
