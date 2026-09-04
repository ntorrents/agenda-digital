'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { formatDiaperTypes, parseDiaperTypes } from '@/lib/diaper'
import { DASHBOARD_STAFF_ROLES } from '@/lib/roles'
import { assertAgendaClassroomAccess, getSchoolClassroom, getTeacherClassroom } from '@/lib/teacher-classroom'
import { PHOTOS_BUCKET } from '@/lib/storage'
import { logAudit } from '@/lib/audit-log'

async function uploadLogPhotos(
  files: File[],
  schoolId: string,
  studentId: string,
  dateStr: string
): Promise<string[]> {
  const admin = createAdminClient()
  const urls: string[] = []

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${schoolId}/daily-logs/${studentId}/${dateStr}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error } = await admin.storage.from(PHOTOS_BUCKET).upload(fileName, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

    if (error) {
      throw new Error("No s'ha pogut pujar la foto: " + error.message)
    }

    const { data } = admin.storage.from(PHOTOS_BUCKET).getPublicUrl(fileName)
    urls.push(data.publicUrl)
  }

  return urls
}

export async function upsertDailyLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !(DASHBOARD_STAFF_ROLES as readonly string[]).includes(profile.role)) {
    throw new Error('No autoritzat')
  }

  const student_id = formData.get('student_id') as string
  const dateStr = formData.get('date') as string

  const { data: student } = await supabase
    .from('students')
    .select('id, school_id, classroom_id')
    .eq('id', student_id)
    .single()

  if (!student?.classroom_id) {
    throw new Error('Alumne sense aula assignada')
  }

  const classroom = await assertAgendaClassroomAccess(
    supabase,
    user.id,
    profile.role,
    student.classroom_id
  )

  const getNullIfEmpty = (val: string | null) => val === '' ? null : val

  const mood = getNullIfEmpty(formData.get('mood') as string | null)
  const meal_breakfast = getNullIfEmpty(formData.get('meal_breakfast') as string | null)
  const meal_lunch = getNullIfEmpty(formData.get('meal_lunch') as string | null)
  const meal_snack = getNullIfEmpty(formData.get('meal_snack') as string | null)
  const diaperRaw = formData.get('diaper_type') as string | null
  const diaper_type = formatDiaperTypes(parseDiaperTypes(diaperRaw))
  const diaper_changes = parseInt(formData.get('diaper_changes') as string || '0', 10)

  const nap_start = getNullIfEmpty(formData.get('nap_start') as string | null)
  const nap_end = getNullIfEmpty(formData.get('nap_end') as string | null)
  const notes = getNullIfEmpty(formData.get('notes') as string | null)

  const photoFiles = formData.getAll('photos').filter(
    (f): f is File => f instanceof File && f.size > 0
  )

  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('id, photos')
    .eq('student_id', student_id)
    .eq('date', dateStr)
    .maybeSingle()

  let photoUrls: string[] = existingLog?.photos || []
  if (photoFiles.length > 0) {
    const uploaded = await uploadLogPhotos(photoFiles, classroom.school_id, student_id, dateStr)
    photoUrls = [...photoUrls, ...uploaded]
  }

  const payload = {
    student_id,
    school_id: classroom.school_id,
    classroom_id: classroom.id,
    date: dateStr,
    teacher_id: user.id,
    mood,
    meal_breakfast,
    meal_lunch,
    meal_snack,
    diaper_type,
    diaper_changes,
    nap_start,
    nap_end,
    notes,
    photos: photoUrls,
  }

  if (existingLog) {
    const { error } = await supabase
      .from('daily_logs')
      .update(payload)
      .eq('id', existingLog.id)

    if (error) throw new Error(error.message)

    await logAudit({
      actorId: user.id,
      action: 'agenda.update',
      entityType: 'daily_log',
      entityId: existingLog.id,
      schoolId: classroom.school_id,
      payload: { studentId: student_id, date: dateStr, classroomId: classroom.id },
    })
  } else {
    const { data: inserted, error } = await supabase
      .from('daily_logs')
      .insert([payload])
      .select('id')
      .single()

    if (error) throw new Error(error.message)

    await logAudit({
      actorId: user.id,
      action: 'agenda.create',
      entityType: 'daily_log',
      entityId: inserted?.id,
      schoolId: classroom.school_id,
      payload: { studentId: student_id, date: dateStr, classroomId: classroom.id },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendas')
  revalidatePath(`/dashboard/agendas/${student_id}`)
  revalidatePath('/mi-hijo/agenda')
  revalidatePath('/mi-hijo/galeria')

  return { success: true }
}

async function resolveClassroomForBulk(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: string,
  classroomId?: string
) {
  if (classroomId) {
    const classroom = await getSchoolClassroom(supabase, userId, role, classroomId)
    if (!classroom) throw new Error('No classroom')
    return classroom
  }
  const classroom = await getTeacherClassroom(supabase, userId, role)
  if (!classroom) throw new Error('No classroom')
  return classroom
}

export async function bulkMarkLunch(dateStr: string, classroomId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('No profile')

  const classroom = await resolveClassroomForBulk(supabase, user.id, profile.role, classroomId)

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('id')
    .eq('classroom_id', classroom.id)
    .eq('date', dateStr)

  if (!logs || logs.length === 0) {
    throw new Error('No hi ha agendes avui. Omple almenys una agenda abans.')
  }

  const { error } = await supabase
    .from('daily_logs')
    .update({ meal_lunch: 'all' })
    .eq('classroom_id', classroom.id)
    .eq('date', dateStr)

  if (error) throw new Error(error.message)

  await logAudit({
    actorId: user.id,
    action: 'agenda.bulk_lunch',
    entityType: 'classroom',
    entityId: classroom.id,
    schoolId: classroom.school_id,
    payload: { date: dateStr, count: logs.length },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendas')
  revalidatePath('/mi-hijo/agenda')

  return { success: true, count: logs.length }
}

