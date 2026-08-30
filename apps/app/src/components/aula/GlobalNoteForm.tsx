'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, MessageSquare, Loader2, X } from 'lucide-react'
import { saveGlobalNoteAndPhoto } from '@/app/actions/aula'
import { useTranslations } from 'next-intl'
import { CameraCapture } from '@/components/media/CameraCapture'

export function GlobalNoteForm({ classroomId, schoolId, dateStr }: { classroomId: string, schoolId: string, dateStr: string }) {
  const router = useRouter()
  const galleryRef = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const t = useTranslations('dashboardAula')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreviewUrl(URL.createObjectURL(selected))
    }
    e.target.value = ''
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim() && !file) return

    setIsLoading(true)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('classroomId', classroomId)
      formData.append('schoolId', schoolId)
      formData.append('dateStr', dateStr)
      if (note.trim()) formData.append('note', note.trim())
      if (file) formData.append('file', file)

      const result = await saveGlobalNoteAndPhoto(formData)

      if (result.success) {
        setSuccess(true)
        setNote('')
        setFile(null)
        setPreviewUrl(null)
        router.refresh()
      } else {
        alert(result.error || t('errorSaving'))
      }
    } catch (err) {
      console.error(err)
      alert(t('errorConnection'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
          {t('successMsg')}
        </div>
      )}

      <div>
        <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider mb-2 flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> {t('formLabelNote')}
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={4}
          className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none font-medium"
          placeholder={t('formPlaceholderNote')}
        />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider mb-2 flex items-center gap-1.5">
          <ImagePlus className="h-3.5 w-3.5" /> {t('formLabelPhoto')}
        </label>

        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {previewUrl ? (
          <div className="relative inline-block">
            <img src={previewUrl} alt="Preview" className="h-32 w-32 object-cover rounded-xl border border-stone-200 shadow-sm" />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 bg-white border border-stone-200 text-stone-500 hover:text-red-600 rounded-full h-6 w-6 flex items-center justify-center shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <CameraCapture
              label={t('btnCamera')}
              onCapture={(selected) => {
                setFile(selected)
                setPreviewUrl(URL.createObjectURL(selected))
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-stone-300 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors text-xs font-bold cursor-pointer"
            />
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-stone-300 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors text-xs font-bold cursor-pointer"
            >
              <ImagePlus className="h-4 w-4" /> {t('btnGallery')}
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || (!note.trim() && !file)}
        className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t('btnPublishing')}
          </>
        ) : (
          t('btnPublish')
        )}
      </button>
    </form>
  )
}
