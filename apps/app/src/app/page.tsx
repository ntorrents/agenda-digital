'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PetitDiariLoader } from '@/components/ui/PetitDiariLoader'
import {
  peekDashboardShellCache,
  peekFamilyShellCache,
} from '@/lib/shell-cache'

export default function HomePage() {
  const router = useRouter()
  // Redirección optimista: si ya hubo sesión en esta pestaña, ir al shell sin esperar perfil.
  const [hint] = useState(() => {
    if (peekFamilyShellCache()) return '/mi-hijo' as const
    if (peekDashboardShellCache()) return '/dashboard' as const
    return null
  })

  useEffect(() => {
    if (hint) {
      router.replace(hint)
    }

    async function checkAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = profile?.role || user.app_metadata?.role
      if (role === 'superadmin') {
        window.location.replace('/superadmin')
      } else if (role === 'admin' || role === 'teacher' || role === 'auxiliary') {
        if (hint !== '/dashboard') router.replace('/dashboard')
      } else if (role === 'guardian') {
        if (hint !== '/mi-hijo') router.replace('/mi-hijo')
      } else {
        router.replace('/login')
      }
    }

    void checkAuth()
  }, [router, hint])

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
      <PetitDiariLoader message="Carregant Petit Diari..." fullScreen />
    </main>
  )
}
