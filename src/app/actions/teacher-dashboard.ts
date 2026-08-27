'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGroupPhoto(dateStr: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: classroom } = await supabase.from('classrooms').select('id').eq('teacher_id', user.id).single()
  if (!classroom) throw new Error('No classroom')

  // Find all logs for today in this classroom
  const { data: logs } = await supabase.from('daily_logs').select('id, photos').eq('classroom_id', classroom.id).eq('date', dateStr)
  
  if (!logs || logs.length === 0) return { success: true, count: 0 }

  const photoUrl = 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80' // Dummy cute classroom photo

  for (const log of logs) {
    const currentPhotos = log.photos || []
    await supabase.from('daily_logs').update({ photos: [...currentPhotos, photoUrl] }).eq('id', log.id)
  }

  revalidatePath('/mi-aula')
  revalidatePath('/mi-hijo/galeria')
  
  return { success: true, count: logs.length }
}


