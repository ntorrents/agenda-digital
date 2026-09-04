'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Megaphone, Loader2, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { recordClientAudit } from '@/app/actions/audit'

export default function AvisosForm({ 
  schoolId, 
  authorId, 
  role, 
  classrooms 
}: { 
  schoolId: string, 
  authorId: string, 
  role: string, 
  classrooms: any[] 
}) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audience, setAudience] = useState(role === 'admin' ? 'school' : 'classroom')
  const [classroomId, setClassroomId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations('dashboardAvisos')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    
    // If classroom audience is selected, a classroom must be provided
    if (audience === 'classroom' && !classroomId) {
      setError(t('formErrorClassroom'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data: inserted, error } = await supabase
      .from('events_announcements')
      .insert({
        school_id: schoolId,
        author_id: authorId,
        title: title.trim(),
        description: description.trim() || null,
        event_type: 'announcement',
        audience,
        classroom_id: audience === 'classroom' ? classroomId : null,
        is_pinned: isPinned,
      })
      .select('id')
      .single()

    if (error) {
      setError(error.message)
      setIsSubmitting(false)
      return
    }

    void recordClientAudit({
      action: 'notice.create',
      entityType: 'events_announcements',
      entityId: inserted?.id,
      payload: { title: title.trim(), audience, classroomId: audience === 'classroom' ? classroomId : null },
    })

    setTitle('')
    setDescription('')
    if (role === 'admin') setAudience('school')
    setClassroomId('')
    setIsPinned(false)
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone-200/60 rounded-[24px] p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Megaphone className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-stone-800">{t('formTitle')}</h3>
      </div>

      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1.5">{t('formLabelTitle')}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder={t('formPlaceholderTitle')}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1.5">{t('formLabelDesc')}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none min-h-[100px]"
          placeholder={t('formPlaceholderDesc')}
        />
      </div>

      {role === 'admin' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">{t('formLabelScope')}</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="school">{t('formScopeSchool')}</option>
              <option value="classroom">{t('formScopeClassroom')}</option>
            </select>
          </div>
          {audience === 'classroom' && (
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5">{t('formLabelClassroom')}</label>
              <select
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required={audience === 'classroom'}
              >
                <option value="">{t('formPlaceholderClassroom')}</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        // Teacher view
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1.5">{t('formLabelClassroom')}</label>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            required
          >
            <option value="">{t('formPlaceholderTeacherClassroom')}</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <input 
          type="checkbox" 
          id="pin" 
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded border-stone-300 focus:ring-blue-500" 
        />
        <label htmlFor="pin" className="text-sm font-medium text-stone-700 cursor-pointer">
          {t('formLabelPin')}
        </label>
      </div>

      {error && (
        <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !title.trim()}
        className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('formBtnPublishing')}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t('formBtnPublish')}
          </>
        )}
      </button>
    </form>
  )
}
