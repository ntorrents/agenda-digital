'use client'

import { useState } from 'react'
import { sendStaffAccessEmail } from '@/app/superadmin/actions'
import { SaButton } from './sa-ui'

export function SaSendAccessButton({
  userId,
  schoolId,
  email,
  alreadySent,
}: {
  userId: string
  schoolId: string
  email: string
  alreadySent: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(alreadySent)

  const handleSend = async () => {
    if (sent && !window.confirm(`Resetejar contrasenya i reenviar accés a ${email}?`)) return

    setLoading(true)
    try {
      const result = await sendStaffAccessEmail(schoolId, userId)
      if (result.error) {
        alert(result.error)
        return
      }
      setSent(true)
      alert(`Accés enviat a ${email}. Revisa la safata d'entrada (i spam).`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SaButton type="button" variant={sent ? 'secondary' : 'primary'} disabled={loading} onClick={handleSend}>
      {loading ? '…' : sent ? 'Reenviar accés' : 'Enviar accés'}
    </SaButton>
  )
}
