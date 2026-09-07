'use server'

import { createClient } from '@/lib/supabase/server'
import { getCachedSchoolSettings } from '@/lib/cache/school-data'
import { logAuditError } from '@/lib/audit-log'

export type FamilyAgendaDailyLog = {
  photos?: (string | null)[] | null
  meal_breakfast?: string | null
  meal_first_course?: string | null
  meal_second_course?: string | null
  meal_dessert?: string | null
  meal_lunch?: string | null
  meal_snack?: string | null
  nap_start?: string | null
  nap_end?: string | null
  diaper_changes?: number | null
  diaper_type?: string | null
  notes?: string | null
  mood?: string | null
  status?: string | null
  teacher?: { full_name?: string | null } | null
}

export type FamilyAgendaPayload = {
  studentName: string
  dailyLog: FamilyAgendaDailyLog | null
  globalNote: string | null
  globalNotePhoto: string | null
  settings: Record<string, unknown>
  isFuture: boolean
}

export async function fetchFamilyAgendaDay(
  studentId: string,
  dateStr: string
): Promise<FamilyAgendaPayload> {
  let actorId: string | null = null
  let schoolId: string | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthenticated')
    actorId = user.id

    const { data: link } = await supabase
      .from('student_guardians')
      .select('student_id')
      .eq('guardian_id', user.id)
      .eq('student_id', studentId)
      .maybeSingle()
    if (!link) throw new Error('Forbidden')

    const selectedDate = new Date(dateStr)
    selectedDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isFuture = selectedDate.getTime() > today.getTime()

    const { data: student } = await supabase
      .from('students')
      .select('first_name, classroom_id, school_id')
      .eq('id', studentId)
      .single()

    schoolId = student?.school_id ?? null

    let dailyLog: FamilyAgendaDailyLog | null = null
    let globalNote: string | null = null
    let globalNotePhoto: string | null = null

    if (!isFuture) {
      const { data: log } = await supabase
        .from('daily_logs')
        .select(
          `
        *,
        teacher:profiles!teacher_id(full_name)
      `
        )
        .eq('student_id', studentId)
        .eq('date', dateStr)
        .eq('status', 'published')
        .maybeSingle()
      dailyLog = log

      if (student?.classroom_id) {
        const { data: gn } = await supabase
          .from('classroom_daily_notes')
          .select('note, photo_url')
          .eq('classroom_id', student.classroom_id)
          .eq('date', dateStr)
          .maybeSingle()
        if (gn) {
          globalNote = gn.note?.trim() || null
          globalNotePhoto = gn.photo_url || null
        }
      }
    }

    const settings = student?.school_id
      ? await getCachedSchoolSettings(student.school_id)
      : {}

    return {
      studentName: student?.first_name || '',
      dailyLog,
      globalNote,
      globalNotePhoto,
      settings,
      isFuture,
    }
  } catch (e) {
    // No registrar Forbidden/Unauthenticated com a error de sistema (soroll)
    const msg = e instanceof Error ? e.message : String(e)
    if (msg !== 'Forbidden' && msg !== 'Unauthenticated') {
      await logAuditError({
        action: 'error.family_agenda',
        entityType: 'daily_log',
        error: e,
        actorId,
        schoolId,
        context: { studentId, dateStr },
      })
    }
    throw e
  }
}
