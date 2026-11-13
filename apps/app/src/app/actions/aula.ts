'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { assertClassroomAccess } from '@/lib/teacher-classroom'
import { DASHBOARD_STAFF_ROLES } from '@/lib/roles'
import { PHOTOS_BUCKET } from '@/lib/storage'
import { logAudit } from '@/lib/audit-log'
import { MAX_CLASSROOM_GROUP_PHOTOS } from '@/lib/daily-log-photos'
import { classNotePhotoUrls } from '@/lib/photos'

function syncPhotoFields(urls: string[]) {
  const cleaned = urls.filter(Boolean)
  return {
    photo_urls: cleaned,
    photo_url: cleaned[0] || null,
  }
}

async function requireStaffClassroomAccess(classroomId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticat' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !(DASHBOARD_STAFF_ROLES as readonly string[]).includes(profile.role)) {
    return { error: 'No autoritzat' as const }
  }

  await assertClassroomAccess(supabase, user.id, profile.role, classroomId)
  return { user, profile }
}

async function uploadClassroomPhotos(
  files: File[],
  schoolId: string,
  classroomId: string,
  dateStr: string
) {
  const admin = createAdminClient()
  const urls: string[] = []

  for (const file of files) {
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${schoolId}/classrooms/${classroomId}/${dateStr}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await admin.storage.from(PHOTOS_BUCKET).upload(fileName, file, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

    if (uploadError) {
      throw new Error("Error pujant la imatge: " + uploadError.message)
    }

    const { data: publicUrlData } = admin.storage.from(PHOTOS_BUCKET).getPublicUrl(fileName)
    urls.push(publicUrlData.publicUrl)
  }

  return urls
}

function revalidateClassroomNotePaths() {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendas')
  revalidatePath('/dashboard/galeria')
  revalidatePath('/mi-hijo/agenda')
  revalidatePath('/mi-hijo/galeria')
}

export async function saveGlobalNoteAndPhoto(formData: FormData) {
  const classroomId = formData.get('classroomId') as string
  const schoolId = formData.get('schoolId') as string
  const dateStr = formData.get('dateStr') as string
  const note = (formData.get('note') as string) || ''
  const singleFile = formData.get('file') as File | null
  const multiFiles = formData
    .getAll('photos')
    .filter((f): f is File => f instanceof File && f.size > 0)

  if (singleFile instanceof File && singleFile.size > 0) {
    multiFiles.unshift(singleFile)
  }

  if (!classroomId || !schoolId || !dateStr) {
    return { success: false, error: 'Dades incompletes' }
  }

  if (!note.trim() && multiFiles.length === 0) {
    return { success: false, error: 'Afegeix una nota o una foto' }
  }

  try {
    const access = await requireStaffClassroomAccess(classroomId)
    if ('error' in access) return { success: false, error: access.error }

    const admin = createAdminClient()

    const { data: existingGlobal } = await admin
      .from('classroom_daily_notes')
      .select('id, note, photo_url, photo_urls')
      .eq('classroom_id', classroomId)
      .eq('date', dateStr)
      .maybeSingle()

    const existingUrls = classNotePhotoUrls(existingGlobal || {})
    let nextUrls = existingUrls

    if (multiFiles.length > 0) {
      const remaining = Math.max(0, MAX_CLASSROOM_GROUP_PHOTOS - existingUrls.length)
      if (remaining === 0) {
        return {
          success: false,
          error: `Máximo ${MAX_CLASSROOM_GROUP_PHOTOS} fotos grupales por día`,
        }
      }
      const toUpload = multiFiles.slice(0, remaining)
      const uploaded = await uploadClassroomPhotos(toUpload, schoolId, classroomId, dateStr)
      nextUrls = [...existingUrls, ...uploaded]
    }

    const photoFields = syncPhotoFields(nextUrls)
    const payload = {
      school_id: schoolId,
      classroom_id: classroomId,
      teacher_id: access.user.id,
      date: dateStr,
      note: note.trim() || existingGlobal?.note || null,
      ...photoFields,
    }

    if (existingGlobal) {
      const { error } = await admin
        .from('classroom_daily_notes')
        .update(payload)
        .eq('id', existingGlobal.id)

      if (error) return { success: false, error: error.message }
    } else {
      const { error } = await admin.from('classroom_daily_notes').insert(payload)

      if (error) return { success: false, error: error.message }
    }

    await logAudit({
      actorId: access.user.id,
      action: 'classroom_note.save',
      entityType: 'classroom_daily_notes',
      entityId: existingGlobal?.id || classroomId,
      schoolId,
      payload: {
        classroomId,
        date: dateStr,
        photoCount: nextUrls.length,
        addedPhotos: multiFiles.length,
      },
    })

    revalidateClassroomNotePaths()
    return { success: true, photoUrls: nextUrls }
  } catch (error: unknown) {
    console.error('saveGlobalNoteAndPhoto error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconegut',
    }
  }
}

export async function removeClassroomGroupPhoto(formData: FormData) {
  const classroomId = formData.get('classroomId') as string
  const schoolId = formData.get('schoolId') as string
  const dateStr = formData.get('dateStr') as string
  const photoUrl = formData.get('photoUrl') as string

  if (!classroomId || !schoolId || !dateStr || !photoUrl) {
    return { success: false, error: 'Dades incompletes' }
  }

  try {
    const access = await requireStaffClassroomAccess(classroomId)
    if ('error' in access) return { success: false, error: access.error }

    const admin = createAdminClient()
    const { data: existingGlobal } = await admin
      .from('classroom_daily_notes')
      .select('id, note, photo_url, photo_urls')
      .eq('classroom_id', classroomId)
      .eq('date', dateStr)
      .maybeSingle()

    if (!existingGlobal) {
      return { success: false, error: 'No hi ha foto grupal' }
    }

    const nextUrls = classNotePhotoUrls(existingGlobal).filter((url) => url !== photoUrl)
    const photoFields = syncPhotoFields(nextUrls)

    const { error } = await admin
      .from('classroom_daily_notes')
      .update({
        ...photoFields,
        teacher_id: access.user.id,
      })
      .eq('id', existingGlobal.id)

    if (error) return { success: false, error: error.message }

    await logAudit({
      actorId: access.user.id,
      action: 'classroom_note.remove_photo',
      entityType: 'classroom_daily_notes',
      entityId: existingGlobal.id,
      schoolId,
      payload: { classroomId, date: dateStr, removed: photoUrl, remaining: nextUrls.length },
    })

    revalidateClassroomNotePaths()
    return { success: true, photoUrls: nextUrls }
  } catch (error: unknown) {
    console.error('removeClassroomGroupPhoto error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconegut',
    }
  }
}
