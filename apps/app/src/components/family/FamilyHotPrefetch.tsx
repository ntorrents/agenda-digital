'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import { fetchFamilyAgendaDay } from '@/app/actions/family-agenda'
import { useFamilyStudent } from '@/components/family/FamilyStudentProvider'
import {
  FAMILY_AGENDA_DEDUP_MS,
  familyAgendaKey,
  readFamilyAgendaCache,
  writeFamilyAgendaCache,
} from '@/lib/family-data-cache'

/**
 * Tras montar el shell de familia: prefetch de rutas calientes + agenda de hoy
 * en background (SWR + sessionStorage). Abrir la app no espera estos datos.
 */
export function FamilyHotPrefetch() {
  const router = useRouter()
  const { activeStudentId } = useFamilyStudent()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const routes = [
      `/mi-hijo/agenda?date=${today}`,
      `/mi-hijo/galeria?date=${today}`,
      `/mi-hijo/avisos?date=${today}`,
      `/mi-hijo/mensajes?date=${today}`,
      `/mi-hijo/calendario?date=${today}`,
      '/mi-hijo/menus',
      '/mi-hijo/ayuda',
    ]
    for (const href of routes) {
      try {
        router.prefetch(href)
      } catch {
        // ignore
      }
    }
  }, [router])

  useEffect(() => {
    if (!activeStudentId) return

    let cancelled = false
    const today = new Date().toISOString().split('T')[0]
    const key = familyAgendaKey(activeStudentId, today)
    const cached = readFamilyAgendaCache(activeStudentId, today)

    // Si ya hay cache fresca reciente, no spamear; si está stale o ausente, prefetch.
    if (cached?.fresh && Date.now() - cached.at < FAMILY_AGENDA_DEDUP_MS) {
      void mutate(key, cached.payload, { revalidate: false })
      return
    }

    void (async () => {
      try {
        const payload = await fetchFamilyAgendaDay(activeStudentId, today)
        if (cancelled) return
        writeFamilyAgendaCache(activeStudentId, today, payload, true)
        await mutate(key, payload, { revalidate: false })
      } catch {
        // Prefetch best-effort; la página de agenda reintentará al abrir.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [activeStudentId])

  return null
}
