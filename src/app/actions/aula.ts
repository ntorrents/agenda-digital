'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveGlobalNoteAndPhoto(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticat' }

  const classroomId = formData.get('classroomId') as string
  const schoolId = formData.get('schoolId') as string
  const dateStr = formData.get('dateStr') as string
  const note = formData.get('note') as string || ''
  const file = formData.get('file') as File | null

  if (!classroomId || !schoolId || !dateStr) {
    return { success: false, error: 'Dades incompletes' }
  }

  try {
    let imageUrl = null

    // 1. Upload photo if present
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${schoolId}/classrooms/${classroomId}/${dateStr}-${Math.random()}.${fileExt}`
      
      const { error: uploadError, data } = await supabase.storage
        .from('media') // Assumes a 'media' bucket exists
        .upload(fileName, file)
        
      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        // If the bucket doesn't exist or fails, we gracefully continue without the image
        // return { success: false, error: 'Error pujant la imatge' }
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName)
        imageUrl = publicUrlData.publicUrl
      }
    }

    // 2. Insert or Update into events_announcements as NOTAGLOBAL
    const content = note + (imageUrl ? `\n\n[Foto Grupal](${imageUrl})` : '')
    
    // Check if it already exists
    const { data: existingGlobal } = await supabase
      .from('events_announcements')
      .select('id')
      .eq('classroom_id', classroomId)
      .eq('event_date', dateStr)
      .eq('title', 'NOTAGLOBAL')
      .single()

    if (existingGlobal) {
      await supabase
        .from('events_announcements')
        .update({ description: content })
        .eq('id', existingGlobal.id)
    } else {
      await supabase
        .from('events_announcements')
        .insert({
          school_id: schoolId,
          classroom_id: classroomId,
          author_id: user.id,
          title: `NOTAGLOBAL`,
          description: content,
          event_type: 'announcement',
          audience: 'classroom',
          event_date: dateStr
        })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/aula')
    revalidatePath('/dashboard/agendas')

    return { success: true }

  } catch (error: any) {
    console.error('saveGlobalNoteAndPhoto error:', error)
    return { success: false, error: error.message }
  }
}
