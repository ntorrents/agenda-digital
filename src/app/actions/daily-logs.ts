'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function uploadLogPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  files: File[],
  schoolId: string,
  studentId: string,
  dateStr: string
): Promise<string[]> {
  const urls: string[] = []

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${schoolId}/daily-logs/${studentId}/${dateStr}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error } = await supabase.storage.from('media').upload(fileName, file)

    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(fileName)
      urls.push(data.publicUrl)
    }
  }

  return urls
}

export async function upsertDailyLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get classroom id
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, school_id')
    .eq('teacher_id', user.id)
    .single()

  if (!classroom) {
    throw new Error('No classroom found for teacher')
  }

  const student_id = formData.get('student_id') as string
  const dateStr = formData.get('date') as string

  // Extract other fields (handling empty strings as null for enums)
  const getNullIfEmpty = (val: string | null) => val === '' ? null : val

  const mood = getNullIfEmpty(formData.get('mood') as string | null)
  const meal_breakfast = getNullIfEmpty(formData.get('meal_breakfast') as string | null)
  const meal_lunch = getNullIfEmpty(formData.get('meal_lunch') as string | null)
  const meal_snack = getNullIfEmpty(formData.get('meal_snack') as string | null)
  const diaper_type = getNullIfEmpty(formData.get('diaper_type') as string | null)
  const diaper_changes = parseInt(formData.get('diaper_changes') as string || '0', 10)
  
  const nap_start = getNullIfEmpty(formData.get('nap_start') as string | null)
  const nap_end = getNullIfEmpty(formData.get('nap_end') as string | null)
  const notes = getNullIfEmpty(formData.get('notes') as string | null)

  const photoFiles = formData.getAll('photos').filter(
    (f): f is File => f instanceof File && f.size > 0
  )

  // Check if daily log already exists to get its ID, otherwise insert
  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('id, photos')
    .eq('student_id', student_id)
    .eq('date', dateStr)
    .maybeSingle()

  let photoUrls: string[] = existingLog?.photos || []
  if (photoFiles.length > 0) {
    const uploaded = await uploadLogPhotos(supabase, photoFiles, classroom.school_id, student_id, dateStr)
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
    ...(photoUrls.length > 0 ? { photos: photoUrls } : {}),
  }

  if (existingLog) {
    const { error } = await supabase
      .from('daily_logs')
      .update(payload)
      .eq('id', existingLog.id)
      
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('daily_logs')
      .insert([payload])

    if (error) throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendas')
  revalidatePath(`/dashboard/agendas/${student_id}`)
  
  return { success: true }
}

// Bulk Actions
export async function bulkMarkPresent(dateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, school_id')
    .eq('teacher_id', user.id)
    .single()

  if (!classroom) throw new Error('No classroom')

  // Find all students in this classroom
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('classroom_id', classroom.id)
    
  if (!students) return { success: false }

  // Get existing logs for today
  const { data: existingLogs } = await supabase
    .from('daily_logs')
    .select('student_id')
    .eq('classroom_id', classroom.id)
    .eq('date', dateStr)

  const existingIds = new Set(existingLogs?.map(l => l.student_id))
  
  // Find students who don't have a log
  const studentsWithoutLog = students.filter(s => !existingIds.has(s.id))
  
  if (studentsWithoutLog.length === 0) return { success: true, count: 0 }

  const payloads = studentsWithoutLog.map(s => ({
    student_id: s.id,
    school_id: classroom.school_id,
    classroom_id: classroom.id,
    date: dateStr,
    teacher_id: user.id,
    mood: 'calm' // Default mood for bulk present
  }))

  const { error } = await supabase.from('daily_logs').insert(payloads)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendas')
  
  return { success: true, count: studentsWithoutLog.length }
}

export async function bulkMarkLunch(dateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, school_id')
    .eq('teacher_id', user.id)
    .single()

  if (!classroom) throw new Error('No classroom')

  // Update all logs for this classroom on this date
  const { error, count } = await supabase
    .from('daily_logs')
    .update({ meal_lunch: 'all' })
    .eq('classroom_id', classroom.id)
    .eq('date', dateStr)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendas')
  
  return { success: true }
}

export async function bulkAddNote(dateStr: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, school_id')
    .eq('teacher_id', user.id)
    .single()

  if (!classroom) throw new Error('No classroom')

  // Update all logs for this classroom on this date
  // Since we want to APPEND note or replace if empty, this might be tricky with just update.
  // We can fetch existing logs, append, and update.
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('id, notes')
    .eq('classroom_id', classroom.id)
    .eq('date', dateStr)

  if (!logs) return { success: true }

  for (const log of logs) {
    const newNote = log.notes ? `${log.notes}\n\nNota General: ${note}` : `\n\nNota General: ${note}`
    await supabase.from('daily_logs').update({ notes: newNote }).eq('id', log.id)
  }
  
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendas')
  
  return { success: true }
}
