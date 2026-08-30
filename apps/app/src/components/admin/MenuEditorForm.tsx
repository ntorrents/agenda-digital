'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, Image as ImageIcon, Upload, FileText, CheckCircle2 } from 'lucide-react'
import { upsertMenu } from '@/app/actions/menu'
import { useTranslations, useLocale } from 'next-intl'

type ExistingMenu = {
  id?: string
  title?: string | null
  description?: string | null
  file_url?: string | null
}

function previewFromMenu(menu?: ExistingMenu | null): string | null {
  if (!menu?.file_url) return null
  const url = menu.file_url.toLowerCase()
  if (url.includes('.pdf')) return 'pdf'
  return menu.file_url
}

export function MenuEditorForm({
  currentMonth,
  currentYear,
  existingMenu,
}: {
  currentMonth: number
  currentYear: number
  existingMenu: ExistingMenu | null
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(() => previewFromMenu(existingMenu))
  const [hasNewFile, setHasNewFile] = useState(false)

  const t = useTranslations('menuEditor')
  const locale = useLocale()

  useEffect(() => {
    setFilePreview(previewFromMenu(existingMenu))
    setHasNewFile(false)
    setErrorMsg('')
    setSuccessMsg(false)
  }, [currentMonth, currentYear, existingMenu?.id, existingMenu?.file_url])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(t('fileTooBig'))
      return
    }

    setHasNewFile(true)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setFilePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setFilePreview('pdf')
    }
    setErrorMsg('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg(false)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      formData.append('month', currentMonth.toString())
      formData.append('year', currentYear.toString())

      await upsertMenu(formData)
      setSuccessMsg(true)
      setHasNewFile(false)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t('errorSaving'))
    } finally {
      setIsSaving(false)
    }
  }

  const currentMonthName = new Date(currentYear, currentMonth - 1).toLocaleString(locale, {
    month: 'long',
  })

  const showExistingImage =
    !hasNewFile && filePreview && filePreview !== 'pdf'
  const showExistingPdf =
    !hasNewFile && filePreview === 'pdf'
  const showNewImage = hasNewFile && filePreview && filePreview !== 'pdf'
  const showNewPdf = hasNewFile && filePreview === 'pdf'

  return (
    <form key={`${currentYear}-${currentMonth}`} onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-200">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200">
          {t('successMsg')}
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-[28px] p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-bold text-stone-700">{t('labelTitle')}</label>
          <input
            type="text"
            name="title"
            defaultValue={existingMenu?.title || t('defaultMenuTitle', { month: currentMonthName })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-stone-700">{t('labelDesc')}</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={existingMenu?.description || ''}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none focus:border-teal-500 resize-none"
            placeholder={t('descPlaceholder')}
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-stone-700">{t('labelFile')}</label>

          {existingMenu?.file_url && !hasNewFile && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {t('existingFileHint')}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 border-dashed">
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl bg-white border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
              {showNewImage || showExistingImage ? (
                <img
                  src={showNewImage ? filePreview! : existingMenu?.file_url || filePreview!}
                  alt="Menu preview"
                  className="w-full h-full object-cover"
                />
              ) : showNewPdf || showExistingPdf ? (
                <FileText className="h-10 w-10 text-rose-500" />
              ) : (
                <ImageIcon className="h-8 w-8 text-stone-300" />
              )}
            </div>

            <div className="space-y-3 flex-1 w-full">
              <input
                type="file"
                name="file"
                id={`file-upload-${currentYear}-${currentMonth}`}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
              <label
                htmlFor={`file-upload-${currentYear}-${currentMonth}`}
                className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-bold cursor-pointer hover:bg-stone-50 transition-colors w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                {existingMenu?.file_url ? t('btnReplace') : t('btnUpload')}
              </label>
              <p className="text-xs text-stone-500 leading-relaxed">{t('fileHelp')}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-base shadow-md shadow-teal-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
      >
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        {t('btnSave')}
      </button>
    </form>
  )
}
