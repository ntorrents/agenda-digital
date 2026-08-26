'use client'

import { useState } from 'react'
import { Save, ChevronLeft } from 'lucide-react'
import { MoodSelector } from '@/components/agenda/MoodSelector'
import { MealSelector } from '@/components/agenda/MealSelector'
import { DiaperSelector } from '@/components/agenda/DiaperSelector'
import { NapTracker } from '@/components/agenda/NapTracker'
import { PhotoUploader } from '@/components/agenda/PhotoUploader'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Mood, MealAmount, DiaperType } from '@/types/enums'
import { useTranslations } from 'next-intl'

interface DailyLogFormData {
  mood: Mood | null
  meals: {
    breakfast: MealAmount | null
    lunch: MealAmount | null
    snack: MealAmount | null
  }
  diaperType: DiaperType | null
  diaperChanges: number
  napStart: string | null
  napEnd: string | null
  photos: string[]
  notes: string
}

interface DailyLogFormProps {
  studentName?: string
  initialData?: Partial<DailyLogFormData>
  onSave?: (data: DailyLogFormData) => void
  onBack?: () => void
  className?: string
}

const defaultData: DailyLogFormData = {
  mood: null,
  meals: { breakfast: null, lunch: null, snack: null },
  diaperType: null,
  diaperChanges: 0,
  napStart: null,
  napEnd: null,
  photos: [],
  notes: '',
}

export function DailyLogForm({
  studentName = 'Alumne',
  initialData,
  onSave,
  onBack,
  className,
}: DailyLogFormProps) {
  const t = useTranslations('dailyLog')
  const tCommon = useTranslations('common')
  const [data, setData] = useState<DailyLogFormData>({
    ...defaultData,
    ...initialData,
  })

  const handleSave = () => {
    onSave?.(data)
  }

  const today = new Date().toLocaleDateString('ca-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className={cn('mx-auto w-full max-w-lg space-y-4 pb-10', className)}>
      
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-stone-200 shadow-2xs text-stone-600 hover:text-stone-900 cursor-pointer active:scale-95 transition-all"
            aria-label={tCommon('back')}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-black text-stone-900 leading-tight">{studentName}</h1>
          <p className="text-xs text-stone-500 font-medium capitalize">{today}</p>
        </div>
      </div>

      {/* Mood Card */}
      <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs">
        <MoodSelector
          value={data.mood}
          onChange={(mood) => setData((d) => ({ ...d, mood }))}
        />
      </div>

      {/* Meals Card */}
      <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs">
        <MealSelector
          value={data.meals}
          onChange={(meals) => setData((d) => ({ ...d, meals }))}
        />
      </div>

      {/* Diaper Card */}
      <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs">
        <DiaperSelector
          type={data.diaperType}
          changes={data.diaperChanges}
          onTypeChange={(diaperType) => setData((d) => ({ ...d, diaperType }))}
          onChangesChange={(diaperChanges) => setData((d) => ({ ...d, diaperChanges }))}
        />
      </div>

      {/* Nap Card */}
      <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs">
        <NapTracker
          napStart={data.napStart}
          napEnd={data.napEnd}
          onNapStartChange={(napStart) => setData((d) => ({ ...d, napStart }))}
          onNapEndChange={(napEnd) => setData((d) => ({ ...d, napEnd }))}
        />
      </div>

      {/* Photos Card */}
      <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs">
        <PhotoUploader
          photos={data.photos}
          onPhotosChange={(photos) => setData((d) => ({ ...d, photos }))}
        />
      </div>

      {/* Notes Card */}
      <div className="rounded-[24px] border border-stone-200/80 bg-white p-5 shadow-xs space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
          {t('notes')}
        </span>
        <Textarea
          placeholder={t('notesPlaceholder')}
          value={data.notes}
          onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
          rows={3}
          className="resize-none rounded-2xl border-stone-200 bg-stone-50/60 focus-visible:ring-teal-700 text-xs font-medium text-stone-800"
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full h-13 rounded-[22px] bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-teal-700/25 transition-all cursor-pointer"
      >
        <Save className="mr-2 h-4 w-4" />
        {tCommon('save')}
      </Button>

    </div>
  )
}
