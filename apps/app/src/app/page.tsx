'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PetitDiariLoader } from '@/components/ui/PetitDiariLoader'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

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
      } else if (role === 'admin') {
        router.replace('/dashboard')
      } else if (role === 'teacher') {
        router.replace('/dashboard')
      } else if (role === 'guardian') {
        router.replace('/mi-hijo')
      } else {
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center">
      <PetitDiariLoader message="Carregant Petit Diari..." fullScreen />
    </main>
  )
}
