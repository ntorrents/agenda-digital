'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DailyLogForm } from '@/components/agenda/DailyLogForm'
import { CheckCircle2 } from 'lucide-react'

export default function StudentLogPage() {
  const router = useRouter()
  const params = useParams()
  const [saveSuccess, setSaveSuccess] = useState(false)

  // In a real app, fetch student details using params.id
  const studentId = params.id as string
  const studentName = studentId === '66666666-6666-6666-6666-666666666661' ? 'Nil Puig' 
    : studentId === '66666666-6666-6666-6666-666666666662' ? 'Mia Vila'
    : 'Leo Martín'

  return (
    <main className="px-4 sm:px-6 pt-4 pb-8 w-full max-w-2xl mx-auto">
      
      {saveSuccess && (
        <div className="mb-4 p-4 rounded-[20px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          Agenda desada correctament a la base de dades!
        </div>
      )}

      <DailyLogForm
        studentName={studentName}
        onBack={() => {
          router.push('/mi-aula/alumnos')
        }}
        onSave={async (data) => {
          console.log('Guardando en Supabase:', data)
          setSaveSuccess(true)
          setTimeout(() => {
            router.push('/mi-aula/alumnos')
          }, 1200)
        }}
      />
    </main>
  )
}
