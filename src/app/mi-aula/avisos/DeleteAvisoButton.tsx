'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteAnnouncement } from '@/app/actions/announcements'

export function DeleteAvisoButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Segur que vols eliminar aquest avís?')) return
    
    setIsDeleting(true)
    try {
      await deleteAnnouncement(id)
    } catch (e: any) {
      alert("Error: " + e.message)
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 rounded-full text-stone-300 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
      title="Eliminar avís"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4" />}
    </button>
  )
}
