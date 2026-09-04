'use client'

import { Utensils, Moon, Droplets, Smile, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { normalizeDiaperTypes } from '@/lib/diaper'
import type { DiaperType } from '@/types/enums'
import { AgendaDayNote } from '@/components/family/AgendaDayNote'
import { PhotoStrip } from '@/components/media/PhotoStrip'
import type { FamilyAgendaPayload } from '@/app/actions/family-agenda'

export function FamilyAgendaView({
  payload,
}: {
  payload: FamilyAgendaPayload
}) {
  const t = useTranslations('agenda')
  const { dailyLog, globalNote, globalNotePhoto, settings, isFuture } = payload

  const mealMap: Record<string, string> = {
    all: t('meals.all'),
    most: t('meals.most'),
    little: t('meals.little'),
    none: t('meals.none'),
  }

  const moodMap: Record<string, string> = {
    happy: t('mood.happy'),
    calm: t('mood.calm'),
    sad: t('mood.sad'),
    irritable: t('mood.irritable'),
  }

  const diaperMap: Record<DiaperType, string> = {
    soft: t('diaper.soft'),
    normal: t('diaper.normal'),
    liquid: t('diaper.liquid'),
  }

  const dayNote =
    globalNote || globalNotePhoto ? (
      <AgendaDayNote
        note={globalNote}
        photoUrl={globalNotePhoto}
        title={t('globalNotes')}
        photoAlt={t('photo')}
      />
    ) : null

  return (
    <main className="max-w-md mx-auto pt-4 space-y-5">
      <div className="space-y-5">
        {isFuture ? (
          <div className="rounded-[28px] border border-stone-200/80 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">{t('noData')}</h3>
            <p className="text-xs text-stone-500 mt-1">{t('futureDay')}</p>
          </div>
        ) : !dailyLog ? (
          <>
            {dayNote}
            <div className="rounded-[28px] border border-stone-200/80 bg-stone-50 p-8 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-400 mb-3 shadow-sm">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-800">{t('notFilled')}</h3>
              <p className="text-xs text-stone-500 mt-1">
                {globalNote || globalNotePhoto ? t('dayNoteOnly') : t('notFilledDesc')}
              </p>
            </div>
          </>
        ) : (
          <>
            {dayNote}
            {dailyLog.photos && dailyLog.photos.length > 0 && (
              <div className="bg-white border border-stone-200/60 rounded-[28px] p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-[11px] font-black uppercase text-stone-400 flex items-center gap-1.5 tracking-wider">
                    {t('galleryOfDay')}
                  </h3>
                  <Link
                    href={`/mi-hijo/galeria`}
                    className="text-[11px] text-teal-600 font-bold flex items-center"
                  >
                    {t('seeAll')} <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <PhotoStrip
                  photos={dailyLog.photos.filter(Boolean) as string[]}
                  altPrefix={t('photo')}
                />
              </div>
            )}

            {settings.agenda_food !== false && (
              <div className="bg-[#8cc63f]/10 border border-[#8cc63f]/30 rounded-[28px] p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#8cc63f] text-white p-1.5 rounded-xl">
                    <Utensils className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-black text-[#6b992f] uppercase tracking-wider">
                    {t('food')}
                  </h3>
                </div>

                <div className="space-y-3">
                  {dailyLog.meal_breakfast && (
                    <div className="flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-white">
                      <span className="text-xs font-bold text-stone-700">{t('breakfast')}</span>
                      <span className="text-xs font-black bg-white px-3 py-1 rounded-full text-[#6b992f] shadow-sm">
                        {mealMap[dailyLog.meal_breakfast]}
                      </span>
                    </div>
                  )}
                  {dailyLog.meal_lunch && (
                    <div className="flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-white">
                      <span className="text-xs font-bold text-stone-700">{t('lunch')}</span>
                      <span className="text-xs font-black bg-white px-3 py-1 rounded-full text-[#6b992f] shadow-sm">
                        {mealMap[dailyLog.meal_lunch]}
                      </span>
                    </div>
                  )}
                  {dailyLog.meal_snack && (
                    <div className="flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-white">
                      <span className="text-xs font-bold text-stone-700">{t('snack')}</span>
                      <span className="text-xs font-black bg-white px-3 py-1 rounded-full text-[#6b992f] shadow-sm">
                        {mealMap[dailyLog.meal_snack]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {settings.agenda_nap !== false && (
                <div className="bg-emerald-50/80 border border-emerald-100 rounded-[24px] p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Moon className="h-4 w-4 text-emerald-600" />
                    <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">
                      {t('sleep')}
                    </span>
                  </div>
                  <p className="text-sm font-black text-stone-800">
                    {dailyLog.nap_start && dailyLog.nap_end ? t('slept') : t('didnSlept')}
                  </p>
                  {dailyLog.nap_start && dailyLog.nap_end && (
                    <p className="text-xs font-medium text-stone-500 mt-1">
                      {t('from')} {dailyLog.nap_start.substring(0, 5)} {t('to')}{' '}
                      {dailyLog.nap_end.substring(0, 5)}
                    </p>
                  )}
                </div>
              )}

              {settings.agenda_diaper !== false && (
                <div className="bg-amber-50/80 border border-amber-100 rounded-[24px] p-4 shadow-xs">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Droplets className="h-4 w-4 text-amber-600" />
                    <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider">
                      {t('diaperTitle')}
                    </span>
                  </div>
                  <p className="text-sm font-black text-stone-800">
                    {dailyLog.diaper_changes} {t('changes')}
                  </p>
                  {dailyLog.diaper_type && (
                    <p className="text-xs font-medium text-stone-500 mt-1">
                      {normalizeDiaperTypes(dailyLog.diaper_type)
                        .map((type) => diaperMap[type])
                        .join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white border border-orange-200/50 rounded-[28px] overflow-hidden shadow-xs">
              <div className="bg-orange-400/90 px-4 py-2.5">
                <h3 className="text-[11px] font-black uppercase text-white tracking-wider">
                  {t('specificNotes')}
                </h3>
              </div>
              <div className="p-5 bg-orange-50/30">
                {dailyLog.notes && dailyLog.notes.trim() ? (
                  <p className="text-sm font-bold text-stone-800 leading-relaxed italic">
                    &ldquo;{dailyLog.notes.trim()}&rdquo;
                  </p>
                ) : (
                  <p className="text-sm text-stone-400 italic">{t('noNotes')}</p>
                )}

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-medium text-stone-600">
                    {dailyLog.teacher?.full_name || t('teacher')}
                  </span>
                  {dailyLog.mood && settings.agenda_mood !== false && (
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-stone-100 font-bold text-stone-700">
                      <Smile className="h-3.5 w-3.5 text-amber-500" /> {moodMap[dailyLog.mood]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
