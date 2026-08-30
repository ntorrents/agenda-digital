'use client'

import { useRef, useState } from 'react'
import {
  CheckSquare,
  Utensils,
  ChevronDown,
  Loader2,
  ImagePlus,
  CalendarDays,
} from 'lucide-react'
import { bulkMarkLunch } from '@/app/actions/daily-logs'
import { saveGlobalNoteAndPhoto } from '@/app/actions/aula'
import { compressImageFile } from '@/lib/compress-image'
import { useTranslations } from 'next-intl'

type Panel = 'menu' | 'day-note' | 'group-photo'

export function BulkActionsWidget({
  dateStr,
  classroomId,
  schoolId,
  onActionComplete,
}: {
  dateStr: string
  classroomId: string
  schoolId: string
  onActionComplete?: () => void
}) {
  const t = useTranslations('bulkActions')
  const galleryRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>('menu')
  const [isLoading, setIsLoading] = useState(false)
  const [dayNote, setDayNote] = useState('')
  const [globalPhotoPreview, setGlobalPhotoPreview] = useState<string | null>(null)
  const [globalPhotoFile, setGlobalPhotoFile] = useState<File | null>(null)

  const close = () => {
    setIsOpen(false)
    setPanel('menu')
    setDayNote('')
    setGlobalPhotoFile(null)
    setGlobalPhotoPreview(null)
  }

  const handleLunch = async () => {
    if (isLoading) return
    if (!window.confirm(t('lunchConfirm'))) return

    setIsLoading(true)
    try {
      await bulkMarkLunch(dateStr, classroomId)
      alert(t('lunchSuccess'))
      close()
      onActionComplete?.()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDayNote = async () => {
    if (isLoading || !dayNote.trim()) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('classroomId', classroomId)
      formData.append('schoolId', schoolId)
      formData.append('dateStr', dateStr)
      formData.append('note', dayNote.trim())

      const result = await saveGlobalNoteAndPhoto(formData)
      if (!result.success) throw new Error(result.error || t('errorGeneric'))

      alert(t('dayNoteSuccess'))
      close()
      onActionComplete?.()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGlobalPhotoSelect = async (file: File) => {
    const compressed = await compressImageFile(file)
    setGlobalPhotoFile(compressed)
    setGlobalPhotoPreview(URL.createObjectURL(compressed))
  }

  const handleGroupPhoto = async () => {
    if (isLoading || !globalPhotoFile) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('classroomId', classroomId)
      formData.append('schoolId', schoolId)
      formData.append('dateStr', dateStr)
      formData.append('file', globalPhotoFile)

      const result = await saveGlobalNoteAndPhoto(formData)
      if (!result.success) throw new Error(result.error || t('errorGeneric'))

      alert(t('photoSuccess'))
      close()
      onActionComplete?.()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (isOpen) close()
          else setIsOpen(true)
        }}
        className="bg-stone-900 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-stone-800 transition-colors shadow-sm flex items-center gap-1.5"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4" />}
        {t('title')}
        <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && panel === 'menu' && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200/80 rounded-2xl shadow-xl z-10 overflow-hidden animate-in slide-in-from-top-2">
          <div className="p-2 space-y-1">
            <button
              onClick={() => setPanel('day-note')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-start gap-2"
            >
              <CalendarDays className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                {t('dayNote')}
                <span className="block text-[10px] font-medium text-stone-400 mt-0.5">{t('dayNoteHint')}</span>
              </span>
            </button>
            <button
              onClick={() => setPanel('group-photo')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-start gap-2"
            >
              <ImagePlus className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
              <span>
                {t('groupPhoto')}
                <span className="block text-[10px] font-medium text-stone-400 mt-0.5">{t('groupPhotoHint')}</span>
              </span>
            </button>
            <button
              onClick={handleLunch}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 hover:text-stone-900 flex items-start gap-2"
            >
              <Utensils className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {t('lunchAll')}
                <span className="block text-[10px] font-medium text-stone-400 mt-0.5">{t('lunchHint')}</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {isOpen && panel === 'day-note' && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200/80 rounded-2xl shadow-xl z-10 p-3 animate-in fade-in">
          <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider mb-1 block">
            {t('dayNote')}
          </label>
          <p className="text-[10px] text-stone-400 mb-2 leading-relaxed">{t('dayNotePanelHint')}</p>
          <textarea
            value={dayNote}
            onChange={(e) => setDayNote(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            rows={3}
            placeholder={t('dayNotePlaceholder')}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setPanel('menu')}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-stone-500 hover:bg-stone-100"
            >
              {t('back')}
            </button>
            <button
              onClick={handleDayNote}
              disabled={isLoading || !dayNote.trim()}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {isLoading ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      )}

      {isOpen && panel === 'group-photo' && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200/80 rounded-2xl shadow-xl z-10 p-3 animate-in fade-in">
          <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider mb-1 block">
            {t('groupPhoto')}
          </label>
          <p className="text-[10px] text-stone-400 mb-2">{t('groupPhotoPanelHint')}</p>
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleGlobalPhotoSelect(file)
              e.target.value = ''
            }}
          />
          {globalPhotoPreview ? (
            <img
              src={globalPhotoPreview}
              alt="Preview"
              className="w-full h-28 object-cover rounded-xl border border-stone-200 mb-2"
            />
          ) : (
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="w-full py-6 rounded-xl border border-dashed border-stone-300 text-stone-500 text-xs font-bold hover:bg-stone-50"
            >
              {t('pickPhoto')}
            </button>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setPanel('menu')}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-stone-500 hover:bg-stone-100"
            >
              {t('back')}
            </button>
            <button
              onClick={handleGroupPhoto}
              disabled={isLoading || !globalPhotoFile}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isLoading ? t('uploading') : t('publish')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
