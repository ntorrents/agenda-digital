'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ACTIVE_STUDENT_COOKIE,
  classroomLabel,
  displayStudentName,
  resolveActiveStudentId,
  type GuardianStudent,
} from '@/lib/guardian-students'

type FamilyStudentContextValue = {
  students: GuardianStudent[]
  activeStudent: GuardianStudent | null
  activeStudentId: string | null
  hasMultiple: boolean
  setActiveStudent: (studentId: string) => void
  displayName: string
  classroomName: string
}

const FamilyStudentContext = createContext<FamilyStudentContextValue | null>(null)

function setActiveStudentCookie(studentId: string) {
  document.cookie = `${ACTIVE_STUDENT_COOKIE}=${studentId}; path=/; max-age=31536000; SameSite=Lax`
}

export function FamilyStudentProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [students, setStudents] = useState<GuardianStudent[]>([])
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: links } = await supabase
        .from('student_guardians')
        .select(
          `
          student_id,
          is_primary,
          students (
            id,
            first_name,
            alias,
            classroom_id,
            classrooms ( name, level )
          )
        `
        )
        .eq('guardian_id', user.id)
        .order('is_primary', { ascending: false })

      const parsed: GuardianStudent[] = (links || [])
        .map((link) => {
          const raw = link.students
          const student = Array.isArray(raw) ? raw[0] : raw
          if (!student) return null
          const classroom = Array.isArray(student.classrooms)
            ? student.classrooms[0]
            : student.classrooms
          return {
            id: student.id as string,
            first_name: student.first_name as string,
            alias: (student.alias as string | null) ?? null,
            classroom_id: (student.classroom_id as string | null) ?? null,
            classroom_name: (classroom?.name as string | null) ?? null,
            classroom_level: (classroom?.level as string | null) ?? null,
            is_primary: !!link.is_primary,
          }
        })
        .filter((s): s is GuardianStudent => s !== null)

      setStudents(parsed)

      const fromUrl = searchParams.get('student')
      const fromCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${ACTIVE_STUDENT_COOKIE}=`))
        ?.split('=')[1]

      const resolved = resolveActiveStudentId(parsed, fromUrl || fromCookie)
      if (resolved) {
        setActiveStudentId(resolved)
        setActiveStudentCookie(resolved)
      }
    }
    load()
  }, [searchParams])

  const setActiveStudent = useCallback(
    (studentId: string) => {
      if (!students.some((s) => s.id === studentId)) return
      setActiveStudentId(studentId)
      setActiveStudentCookie(studentId)

      const params = new URLSearchParams(searchParams.toString())
      params.set('student', studentId)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      router.refresh()
    },
    [pathname, router, searchParams, students]
  )

  const activeStudent = useMemo(
    () => students.find((s) => s.id === activeStudentId) ?? students[0] ?? null,
    [students, activeStudentId]
  )

  const value = useMemo(
    (): FamilyStudentContextValue => ({
      students,
      activeStudent,
      activeStudentId: activeStudent?.id ?? null,
      hasMultiple: students.length > 1,
      setActiveStudent,
      displayName: activeStudent ? displayStudentName(activeStudent) : 'Infant',
      classroomName: activeStudent ? classroomLabel(activeStudent) : '',
    }),
    [students, activeStudent, setActiveStudent]
  )

  return (
    <FamilyStudentContext.Provider value={value}>
      {children}
    </FamilyStudentContext.Provider>
  )
}

export function useFamilyStudent() {
  const ctx = useContext(FamilyStudentContext)
  if (!ctx) {
    throw new Error('useFamilyStudent must be used within FamilyStudentProvider')
  }
  return ctx
}
