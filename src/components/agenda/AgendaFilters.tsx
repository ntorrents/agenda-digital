'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AgendaDatePicker } from '@/components/agenda/AgendaDatePicker'

interface Classroom {
  id: string
  name: string
  level: string
}

interface AgendaFiltersProps {
  classrooms: Classroom[]
  currentClassroomId: string
  currentDate: string
}

export function AgendaFilters({ classrooms, currentClassroomId, currentDate }: AgendaFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('dashboardAgendas')

  const handleClassroomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('classroom_id', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider pl-1">
          {t('classroomLabel')}
        </label>
        <select
          value={currentClassroomId}
          onChange={handleClassroomChange}
          className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer min-w-[150px]"
        >
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
          ))}
        </select>
      </div>

      <AgendaDatePicker currentDate={currentDate} />
    </div>
  )
}
