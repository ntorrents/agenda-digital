'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteClassroom } from '@/app/actions/admin'

export function DeleteClassroomButton({ classroomId }: { classroomId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Estàs segur d'eliminar aquesta aula? Si conté alumnes no podràs eliminar-la fins que els reassignis.")) return
    
    setIsDeleting(true)
    try {
      await deleteClassroom(classroomId)
    } catch (error: any) {
      alert("Error: No es pot eliminar l'aula. Comprova que no tingui alumnes a dins.")
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-stone-400 hover:text-red-600 bg-stone-50 hover:bg-red-50 p-1.5 rounded-xl transition-colors cursor-pointer"
      title="Eliminar aula"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  )
}
