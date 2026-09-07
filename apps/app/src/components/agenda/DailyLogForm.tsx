'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Smile, Utensils, Droplets, Moon, CheckCircle2, XCircle, ArrowLeft, Image as ImageIcon, Loader2, X } from 'lucide-react'
import { upsertDailyLog } from '@/app/actions/daily-logs'
import { useTranslations, useLocale } from 'next-intl'
import { CameraCapture } from '@/components/media/CameraCapture'
import { formatDiaperTypes, normalizeDiaperTypes, toggleDiaperType } from '@/lib/diaper'
import { compressImageFiles } from '@/lib/compress-image'
import { PhotoLightbox } from '@/components/media/PhotoLightbox'
import type { DiaperType } from '@/types/enums'

interface DailyLogFormProps {
  studentId: string
  studentName: string
  dateStr: string
  classroomId: string
  initialData?: any
  settings?: any
}

export function DailyLogForm({ studentId, studentName, dateStr, classroomId, initialData, settings = {} }: DailyLogFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false)
  const t = useTranslations('dailyLogForm')
  const locale = useLocale()

  const [mood, setMood] = useState<string | null>(initialData?.mood || null)
  const [breakfast, setBreakfast] = useState<string | null>(initialData?.meal_breakfast || null)
  const [firstCourse, setFirstCourse] = useState<string | null>(
    initialData?.meal_first_course || initialData?.meal_lunch || null
  )
  const [secondCourse, setSecondCourse] = useState<string | null>(initialData?.meal_second_course || null)
  const [dessert, setDessert] = useState<string | null>(initialData?.meal_dessert || null)
  const [diaperTypes, setDiaperTypes] = useState<DiaperType[]>(
    normalizeDiaperTypes(initialData?.diaper_type)
  )
  const [diaperChanges, setDiaperChanges] = useState<number>(initialData?.diaper_changes || 0)

  const [didNap, setDidNap] = useState<boolean>(!!(initialData?.nap_start && initialData?.nap_end))
  const [napStart, setNapStart] = useState<string>(initialData?.nap_start || '13:00')
  const [napEnd, setNapEnd] = useState<string>(initialData?.nap_end || '14:30')

  const [notes, setNotes] = useState<string>(initialData?.notes || '')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(
    initialData?.photos?.filter(Boolean) || []
  )
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const addPhotoFiles = async (files: File[]) => {
    if (files.length === 0) return
    const remaining = Math.max(0, 5 - photoFiles.length - photoPreviews.length)
    const selected = files.slice(0, remaining)
    if (selected.length === 0) return

    setIsCompressingPhotos(true)
    try {
      const compressed = await compressImageFiles(selected)
      setPhotoFiles(prev => [...prev, ...compressed])
      setPhotoPreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
    } finally {
      setIsCompressingPhotos(false)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    void addPhotoFiles(Array.from(e.target.files || []))
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    const existingCount = (initialData?.photos?.filter(Boolean) || []).length
    if (index < existingCount) return

    const fileIndex = index - existingCount
    setPhotoFiles(prev => prev.filter((_, i) => i !== fileIndex))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async (status: 'draft' | 'published') => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('student_id', studentId)
      formData.append('date', dateStr)
      formData.append('status', status)
      if (mood) formData.append('mood', mood)
      if (breakfast) formData.append('meal_breakfast', breakfast)
      if (firstCourse) formData.append('meal_first_course', firstCourse)
      if (secondCourse) formData.append('meal_second_course', secondCourse)
      if (dessert) formData.append('meal_dessert', dessert)
      const diaperValue = formatDiaperTypes(diaperTypes)
      if (diaperValue) formData.append('diaper_type', diaperValue)
      formData.append('diaper_changes', diaperChanges.toString())
      if (didNap) {
        formData.append('nap_start', napStart)
        formData.append('nap_end', napEnd)
      }
      if (notes) formData.append('notes', notes)
      photoFiles.forEach(file => formData.append('photos', file))

      const result = await upsertDailyLog(formData)

      const params = new URLSearchParams({
        date: dateStr,
        classroom_id: classroomId,
      })
      if (result.savedAsDraft) {
        params.set('draftSaved', studentName)
      } else if (status === 'published') {
        params.set('sent', studentName)
      }

      router.push(`/dashboard/agendas?${params.toString()}`)
    } catch (error) {
      console.error('Error saving log:', error)
      alert(t('errorSaving'))
    } finally {
      setIsSaving(false)
    }
  }

  const mealOptions = [
    { value: 'all', label: t('mealAll'), active: 'bg-emerald-50 text-emerald-700 shadow-xs' },
    { value: 'most', label: t('mealMost'), active: 'bg-teal-50 text-teal-700 shadow-xs' },
    { value: 'little', label: t('mealLittle'), active: 'bg-amber-50 text-amber-700 shadow-xs' },
    { value: 'none', label: t('mealNone'), active: 'bg-red-50 text-red-700 shadow-xs' },
  ]
  const diaperOptions = [
    { value: 'soft' as DiaperType, label: t('diaperSoft') },
    { value: 'normal' as DiaperType, label: t('diaperNormal') },
    { value: 'liquid' as DiaperType, label: t('diaperLiquid') },
  ]

  const renderMealRow = (
    label: string,
    value: string | null,
    onChange: (v: string) => void
  ) => (
    <div className="bg-stone-50/50 rounded-[20px] p-3 border border-stone-100">
      <label className="text-xs font-bold text-stone-600 mb-2 block">{label}</label>
      <div className="flex bg-white rounded-xl overflow-hidden border border-stone-200/80 p-1">
        {mealOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
              value === opt.value ? opt.active : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )

  const dateLocaleMap: Record<string, string> = {
    ca: 'ca-ES',
    es: 'es-ES',
    fr: 'fr-FR',
    en: 'en-US'
  }
  const dateLocale = dateLocaleMap[locale] || 'ca-ES'
  const formattedDate = new Date(dateStr).toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <div className="bg-white rounded-[32px] p-4 sm:p-6 shadow-sm border border-stone-200/80 mb-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          disabled={isSaving}
          onClick={() => void handleSave('draft')}
          className="h-10 w-10 rounded-full hover:bg-stone-100 -ml-2 shrink-0 cursor-pointer text-stone-500 hover:text-stone-900 transition-colors"
          aria-label={t('btnBackDraft')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black text-stone-900 leading-tight truncate">
            {studentName}
          </h2>
          <p className="text-xs font-semibold text-stone-400 capitalize">
            {t('agendaOf', { date: formattedDate })}
          </p>
          {initialData?.status === 'draft' && (
            <p className="text-[11px] font-bold text-amber-600 mt-0.5">{t('draftBadge')}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">

        {settings.agenda_mood !== false && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-teal-700">
            <Smile className="h-5 w-5" />
            <h3 className="font-bold text-sm tracking-wide">{t('moodTitle')}</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'happy', label: t('moodHappy') },
              { id: 'calm', label: t('moodCalm') },
              { id: 'sad', label: t('moodSad') },
              { id: 'irritable', label: t('moodIrritable') },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-[20px] transition-all cursor-pointer border-2 ${
                  mood === m.id
                    ? 'border-teal-500 bg-teal-50 shadow-sm scale-105'
                    : 'border-stone-100 bg-white hover:border-teal-200 hover:bg-stone-50'
                }`}
              >
                <span className={`text-xs font-bold ${mood === m.id ? 'text-teal-700' : 'text-stone-500'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </section>
        )}

        {settings.agenda_food !== false && (
        <section className="space-y-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-orange-600">
            <Utensils className="h-5 w-5" />
            <h3 className="font-bold text-sm tracking-wide">{t('mealTitle')}</h3>
          </div>

          <div className="space-y-3">
            {renderMealRow(t('mealBreakfast'), breakfast, setBreakfast)}
          </div>

          <div className="rounded-[24px] border border-orange-100 bg-orange-50/40 p-3 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-orange-700/80 px-1">
              {t('mealLunchGroup')}
            </p>
            {renderMealRow(t('mealFirstCourse'), firstCourse, setFirstCourse)}
            {renderMealRow(t('mealSecondCourse'), secondCourse, setSecondCourse)}
            {renderMealRow(t('mealDessert'), dessert, setDessert)}
          </div>
        </section>
        )}

        {settings.agenda_diaper !== false && (
        <section className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-amber-600">
            <Droplets className="h-5 w-5" />
            <h3 className="font-bold text-sm tracking-wide">{t('diaperTitle')}</h3>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-8 bg-stone-50/50 rounded-[20px] p-3 border border-stone-100">
              <label className="text-xs font-bold text-stone-600 mb-2 block">{t('diaperType')}</label>
              <div className="grid grid-cols-3 gap-1.5">
                {diaperOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDiaperTypes(prev => toggleDiaperType(prev, opt.value))}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-colors border cursor-pointer ${
                      diaperTypes.includes(opt.value)
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-white border-stone-200/80 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-4 bg-stone-50/50 rounded-[20px] p-3 border border-stone-100 flex flex-col justify-between">
              <label className="text-xs font-bold text-stone-600 text-center">{t('diaperChanges')}</label>
              <div className="flex items-center justify-between bg-white rounded-xl border border-stone-200/80 p-1">
                <button
                  type="button"
                  onClick={() => setDiaperChanges(Math.max(0, diaperChanges - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 cursor-pointer"
                >-</button>
                <span className="font-black text-sm text-stone-800">{diaperChanges}</span>
                <button
                  type="button"
                  onClick={() => setDiaperChanges(diaperChanges + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 cursor-pointer"
                >+</button>
              </div>
            </div>
          </div>
        </section>
        )}

        {settings.agenda_nap !== false && (
        <section className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <Moon className="h-5 w-5" />
            <h3 className="font-bold text-sm tracking-wide">{t('napTitle')}</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDidNap(true)}
              className={`flex-1 py-3 rounded-[16px] text-xs font-bold border-2 transition-colors flex items-center justify-center gap-2 cursor-pointer ${didNap ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-stone-100 bg-white text-stone-400 hover:border-emerald-200'}`}
            >
              <CheckCircle2 className={`h-4 w-4 ${didNap ? 'text-emerald-500' : 'text-stone-300'}`} /> {t('napYes')}
            </button>
            <button
              type="button"
              onClick={() => setDidNap(false)}
              className={`flex-1 py-3 rounded-[16px] text-xs font-bold border-2 transition-colors flex items-center justify-center gap-2 cursor-pointer ${!didNap ? 'border-red-400 bg-red-50 text-red-800' : 'border-stone-100 bg-white text-stone-400 hover:border-red-200'}`}
            >
              <XCircle className={`h-4 w-4 ${!didNap ? 'text-red-400' : 'text-stone-300'}`} /> {t('napNo')}
            </button>
          </div>

          {didNap && (
            <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
              <div className="flex-1 bg-stone-50 rounded-2xl p-2 border border-stone-100">
                <label className="text-[10px] font-bold text-stone-500 block mb-1 px-1">{t('napStart')}</label>
                <input
                  type="time"
                  value={napStart}
                  onChange={(e) => setNapStart(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-xs font-bold text-stone-700 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div className="text-stone-300 font-bold">-</div>
              <div className="flex-1 bg-stone-50 rounded-2xl p-2 border border-stone-100">
                <label className="text-[10px] font-bold text-stone-500 block mb-1 px-1">{t('napEnd')}</label>
                <input
                  type="time"
                  value={napEnd}
                  onChange={(e) => setNapEnd(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-xs font-bold text-stone-700 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          )}
        </section>
        )}

        <section className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex flex-col gap-3">
            <textarea
              placeholder={t('notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24 bg-stone-50 border border-stone-200/80 rounded-[20px] p-4 text-sm font-medium text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />

            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />

            {photoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoPreviews.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="block cursor-pointer hover:ring-2 hover:ring-teal-500/30 rounded-xl transition-all"
                    >
                      <img src={url} alt="" className="h-20 w-20 object-cover rounded-xl border border-stone-200" />
                    </button>
                    {i >= (initialData?.photos?.filter(Boolean) || []).length && (
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute -top-1.5 -right-1.5 bg-white border border-stone-200 rounded-full h-5 w-5 flex items-center justify-center text-stone-500 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <CameraCapture
                label={isCompressingPhotos ? '…' : t('btnCamera')}
                onCapture={(file) => void addPhotoFiles([file])}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-stone-300 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors text-xs font-bold cursor-pointer"
              />
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-stone-300 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors text-xs font-bold cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" /> {t('btnGallery')}
              </button>
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-stone-100 space-y-2">
          <p className="text-[10px] text-center text-stone-400 font-medium px-2">
            {t('saveHint')}
          </p>
          <Button
            onClick={() => void handleSave('published')}
            disabled={isSaving}
            className="w-full h-14 rounded-2xl bg-[#0f766e] hover:bg-[#0d665f] text-white font-black text-sm shadow-xl shadow-[#0f766e]/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t('btnSaveSend')
            )}
          </Button>
        </div>

      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photoPreviews.map((url, i) => ({ url, alt: `${t('btnGallery')} ${i + 1}` }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  )
}
