'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const event_type = formData.get('event_type') as string // 'event' | 'announcement' | 'alert'
  const is_pinned = formData.get('is_pinned') === 'on'
  const event_date = formData.get('event_date') as string || null

  if (!title || !title.trim()) throw new Error('El títol és obligatori')

  // Obtenemos el aula para asignar `school_id` y `classroom_id`
  const { data: classroom } = await supabase.from('classrooms').select('id, school_id').eq('teacher_id', user.id).single()
  if (!classroom) throw new Error('No tens aula assignada')

  const payload = {
    school_id: classroom.school_id,
    classroom_id: classroom.id,
    author_id: user.id,
    title: title.trim(),
    description: description ? description.trim() : null,
    event_type,
    audience: 'classroom', // Per defecte l'educadora envia a la seva aula
    is_pinned,
    event_date: event_date || null
  }

  const { error } = await supabase.from('events_announcements').insert(payload)
  
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/avisos')
  revalidatePath('/mi-hijo/avisos')
  
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('events_announcements').delete().eq('id', id).eq('author_id', user.id)
  
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/avisos')
  revalidatePath('/mi-hijo/avisos')
  
  return { success: true }
}
