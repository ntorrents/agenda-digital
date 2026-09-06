'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/audit-log'
import { notifyFamiliesOfAnnouncement } from '@/app/actions/notify-families'

export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const event_type = formData.get('event_type') as string
  const is_pinned = formData.get('is_pinned') === 'on'
  const event_date = (formData.get('event_date') as string) || null

  if (!title || !title.trim()) throw new Error('El títol és obligatori')

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, school_id')
    .eq('teacher_id', user.id)
    .single()
  if (!classroom) throw new Error('No tens aula assignada')

  const payload = {
    school_id: classroom.school_id,
    classroom_id: classroom.id,
    author_id: user.id,
    title: title.trim(),
    description: description ? description.trim() : null,
    event_type,
    audience: 'classroom',
    is_pinned,
    event_date: event_date || null,
  }

  const { data: inserted, error } = await supabase
    .from('events_announcements')
    .insert(payload)
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  await logAudit({
    actorId: user.id,
    action: event_type === 'event' ? 'calendar.event_create' : 'notice.create',
    entityType: 'events_announcements',
    entityId: inserted?.id,
    schoolId: classroom.school_id,
    payload: { title: title.trim(), event_type, audience: 'classroom' },
  })

  try {
    await notifyFamiliesOfAnnouncement({
      id: inserted?.id,
      schoolId: classroom.school_id,
      title: title.trim(),
      eventType: event_type === 'event' ? 'event' : 'announcement',
      audience: 'classroom',
      classroomId: classroom.id,
    })
  } catch (e) {
    console.warn('[push] announcement notify failed', e)
  }

  revalidatePath('/dashboard/avisos')
  revalidatePath('/mi-hijo/avisos')

  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('events_announcements')
    .select('school_id, event_type, title')
    .eq('id', id)
    .eq('author_id', user.id)
    .maybeSingle()

  const { error } = await supabase
    .from('events_announcements')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id)

  if (error) throw new Error(error.message)

  await logAudit({
    actorId: user.id,
    action: existing?.event_type === 'event' ? 'calendar.event_delete' : 'notice.delete',
    entityType: 'events_announcements',
    entityId: id,
    schoolId: existing?.school_id,
    payload: { title: existing?.title },
  })

  revalidatePath('/dashboard/avisos')
  revalidatePath('/mi-hijo/avisos')

  return { success: true }
}
