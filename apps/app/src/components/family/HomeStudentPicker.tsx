'use client'

import { cn } from '@/lib/utils'
import { useFamilyStudent } from './FamilyStudentProvider'
import { classroomLabel, displayStudentName } from '@/lib/guardian-students'
import { useTranslations } from 'next-intl'

export function HomeStudentPicker() {
  const { students, activeStudent, hasMultiple, setActiveStudent } = useFamilyStudent()
  const t = useTranslations('familyStudent')

  if (!hasMultiple || !activeStudent) return null

  return (
    <div className="w-full space-y-2.5">
      <p className="text-center text-xs font-bold text-stone-500">{t('pickChild')}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {students.map((student) => {
          const selected = student.id === activeStudent.id
          return (
            <button
              key={student.id}
              type="button"
              onClick={() => setActiveStudent(student.id)}
              className={cn(
                'group flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 transition-all active:scale-[0.98]',
                selected
                  ? 'border-teal-300 bg-teal-50 shadow-sm shadow-teal-100/80'
                  : 'border-stone-200/80 bg-white hover:border-teal-200 hover:bg-teal-50/40'
              )}
            >
              <span
                className={cn(
                  'h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-transform group-hover:scale-105',
                  selected ? 'bg-[#0f766e] text-white' : 'bg-stone-100 text-stone-600'
                )}
              >
                {displayStudentName(student).charAt(0)}
              </span>
              <span className="text-left min-w-0">
                <span
                  className={cn(
                    'block text-sm font-black truncate',
                    selected ? 'text-teal-900' : 'text-stone-700'
                  )}
                >
                  {displayStudentName(student)}
                </span>
                {classroomLabel(student) && (
                  <span className="block text-[10px] font-semibold text-stone-500 truncate max-w-[120px]">
                    {classroomLabel(student)}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
