'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Prefetch de rutas calientes del staff tras montar el shell.
 * No bloquea la apertura del dashboard.
 */
export function DashboardHotPrefetch() {
  const router = useRouter()

  useEffect(() => {
    const routes = [
      '/dashboard',
      '/dashboard/agendas',
      '/dashboard/calendario',
      '/dashboard/galeria',
      '/dashboard/comunicacion',
      '/dashboard/menus',
      '/dashboard/config/alumnos',
      '/dashboard/equipo',
    ]
    for (const href of routes) {
      try {
        router.prefetch(href)
      } catch {
        // ignore
      }
    }
  }, [router])

  return null
}
