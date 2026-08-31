'use client'

import { ChevronDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFamilyStudent } from './FamilyStudentProvider'
import { classroomLabel, displayStudentName } from '@/lib/guardian-students'
import { useTranslations } from 'next-intl'
import { useState, useRef, useEffect } from 'react'

type Variant = 'header' | 'compact'

export function StudentSwitcher({ variant = 'header' }: { variant?: Variant }) {
  const { students, activeStudent, hasMultiple, setActiveStudent } = useFamilyStudent()
  const t = useTranslations('familyStudent')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!hasMultiple || !activeStudent) return null

  if (variant === 'compact') {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-800 hover:bg-teal-100 transition-colors"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="truncate max-w-[72px]">{displayStudentName(activeStudent)}</span>
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <StudentDropdown
            students={students}
            activeId={activeStudent.id}
            onSelect={(id) => {
              setActiveStudent(id)
              setOpen(false)
            }}
            className="right-0 mt-1 min-w-[180px]"
          />
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 rounded-2xl bg-teal-50/80 border border-teal-100 px-3 py-2.5 text-left hover:bg-teal-50 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="h-9 w-9 rounded-xl bg-[#0f766e] flex items-center justify-center shrink-0">
          <span className="text-sm font-black text-white">
            {displayStudentName(activeStudent).charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-teal-600/80">
            {t('viewing')}
          </p>
          <p className="text-sm font-black text-stone-800 truncate">
            {displayStudentName(activeStudent)}
          </p>
          {classroomLabel(activeStudent) && (
            <p className="text-[11px] font-semibold text-teal-700/80 truncate">
              {classroomLabel(activeStudent)}
            </p>
          )}
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-teal-600 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <StudentDropdown
          students={students}
          activeId={activeStudent.id}
          onSelect={(id) => {
            setActiveStudent(id)
            setOpen(false)
          }}
          className="left-0 right-0 mt-1"
        />
      )}
    </div>
  )
}

function StudentDropdown({
  students,
  activeId,
  onSelect,
  className,
}: {
  students: ReturnType<typeof useFamilyStudent>['students']
  activeId: string
  onSelect: (id: string) => void
  className?: string
}) {
  const t = useTranslations('familyStudent')

  return (
    <ul
      role="listbox"
      className={cn(
        'absolute z-50 rounded-2xl border border-stone-200 bg-white shadow-xl py-1.5 overflow-hidden',
        className
      )}
    >
      <li className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-400 flex items-center gap-1.5">
        <Users className="h-3 w-3" /> {t('switchChild')}
      </li>
      {students.map((student) => {
        const selected = student.id === activeId
        return (
          <li key={student.id} role="option" aria-selected={selected}>
            <button
              type="button"
              onClick={() => onSelect(student.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
                selected ? 'bg-teal-50' : 'hover:bg-stone-50'
              )}
            >
              <span
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0',
                  selected ? 'bg-[#0f766e] text-white' : 'bg-stone-100 text-stone-600'
                )}
              >
                {displayStudentName(student).charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-stone-800 truncate">
                  {displayStudentName(student)}
                </span>
                {classroomLabel(student) && (
                  <span className="block text-[11px] font-medium text-stone-500 truncate">
                    {classroomLabel(student)}
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
