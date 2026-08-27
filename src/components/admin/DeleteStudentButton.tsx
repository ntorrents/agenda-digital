'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteStudent } from '@/app/actions/admin'

export function DeleteStudentButton({ studentId }: { studentId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Estàs segur d'eliminar aquest alumne? S'esborraran tots els seus registres.")) return
    
    setIsDeleting(true)
    try {
      await deleteStudent(studentId)
    } catch (error) {
      alert("Error a l'eliminar l'alumne")
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-stone-400 hover:text-red-600 bg-stone-50 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
      title="Eliminar alumne"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  )
}
