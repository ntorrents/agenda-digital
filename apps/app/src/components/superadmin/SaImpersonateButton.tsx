'use client'

import { useState } from 'react'
import { getImpersonationLink } from '@/app/superadmin/erp-actions'
import { SaButton } from './sa-ui'

export function SaImpersonateButton({
  userId,
  label = 'Entrar com',
}: {
  userId: string
  label?: string
}) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const result = await getImpersonationLink(userId)
      if (result.error || !result.url) {
        alert(result.error || 'Error generant enllaç')
        return
      }
      if (!window.confirm(`Obrir sessió com a ${result.fullName || result.email}? S'obrirà una pestanya nova.`)) {
        return
      }
      window.open(result.url, '_blank', 'noopener,noreferrer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SaButton type="button" variant="ghost" disabled={loading} onClick={handleClick}>
      {loading ? '…' : label}
    </SaButton>
  )
}
