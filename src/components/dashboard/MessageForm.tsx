'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2 } from 'lucide-react'

export default function MessageForm({ families, senderId, schoolId }: { families: any[], senderId: string, schoolId: string }) {
  const router = useRouter()
  const [receiverId, setReceiverId] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiverId || !content.trim()) return

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('messages')
      .insert({
        school_id: schoolId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim()
      })

    if (error) {
      setError(error.message)
      setIsSubmitting(false)
      return
    }

    setContent('')
    setReceiverId('')
    setIsSubmitting(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-stone-200/60 shadow-xs p-6 space-y-4">
      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1.5">Família Destinatària</label>
        <select
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          required
        >
          <option value="">Selecciona una família...</option>
          {families.map(f => (
            <option key={f.id} value={f.id}>{f.full_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-stone-700 mb-1.5">Missatge</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none min-h-[120px]"
          placeholder="Escriu el missatge aquí..."
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !receiverId || !content.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar Missatge
          </>
        )}
      </button>
    </form>
  )
}
