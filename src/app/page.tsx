'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

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
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-teal-700" />
        <p className="text-xs font-medium text-stone-500">Carregant Petit Diari...</p>
      </div>
    </main>
  )
}
