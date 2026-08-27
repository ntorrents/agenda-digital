'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, PlusSquare, Loader2 } from 'lucide-react'
import { setStaffAttendance } from '@/app/actions/attendance'

interface Props {
  staffId: string
  currentStatus: 'present' | 'absent' | 'sick' | 'holiday' | null
}

export function StaffAttendanceButtons({ staffId, currentStatus }: Props) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async (status: string) => {
    setIsUpdating(true)
    try {
      await setStaffAttendance(staffId, status)
    } catch (error) {
      alert("Error al marcar assistència")
    } finally {
      setIsUpdating(false)
    }
  }

  // If no record exists for today, we assume 'present' as default as requested by the user
  const effectiveStatus = currentStatus || 'present'

  return (
    <div className="flex items-center gap-1 bg-stone-50 rounded-xl p-1 border border-stone-200/80">
      <button
        onClick={() => handleUpdate('present')}
        disabled={isUpdating}
        title="Present"
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          effectiveStatus === 'present' 
            ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
            : 'text-stone-400 hover:bg-stone-200'
        }`}
      >
        <CheckCircle2 className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => handleUpdate('absent')}
        disabled={isUpdating}
        title="Absent"
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          effectiveStatus === 'absent' 
            ? 'bg-red-100 text-red-700 shadow-sm' 
            : 'text-stone-400 hover:bg-stone-200'
        }`}
      >
        <AlertCircle className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleUpdate('sick')}
        disabled={isUpdating}
        title="Malaltia"
        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
          effectiveStatus === 'sick' 
            ? 'bg-amber-100 text-amber-700 shadow-sm' 
            : 'text-stone-400 hover:bg-stone-200'
        }`}
      >
        <PlusSquare className="h-4 w-4" />
      </button>
      
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-teal-600 ml-1" />}
    </div>
  )
}
