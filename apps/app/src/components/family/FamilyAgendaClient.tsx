'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  fetchFamilyAgendaDay,
  type FamilyAgendaPayload,
} from '@/app/actions/family-agenda'
import { FamilyAgendaView } from '@/components/family/FamilyAgendaView'
import { PageContentSkeleton } from '@/components/ui/skeleton'
import {
  FAMILY_AGENDA_DEDUP_MS,
  emptyFamilyAgendaPayload,
  familyAgendaKey,
  readFamilyAgendaCache,
  writeFamilyAgendaCache,
} from '@/lib/family-data-cache'

type Props = {
  studentId: string
  dateStr: string
  /** SSR opcional; preferimos caché cliente + prefetch */
  fallbackData?: FamilyAgendaPayload | null
}

type Seed = {
  payload?: FamilyAgendaPayload
  alreadyFresh: boolean
}

function readSeed(
  studentId: string,
  dateStr: string,
  fallbackData?: FamilyAgendaPayload | null
): Seed {
  const cached = readFamilyAgendaCache(studentId, dateStr)
  if (cached) {
    return {
      payload: cached.payload,
      alreadyFresh:
        cached.fresh && Date.now() - cached.at < FAMILY_AGENDA_DEDUP_MS,
    }
  }
  if (fallbackData) return { payload: fallbackData, alreadyFresh: false }
  return { payload: undefined, alreadyFresh: false }
}

export function FamilyAgendaClient({ studentId, dateStr, fallbackData }: Props) {
  const [seed] = useState(() => readSeed(studentId, dateStr, fallbackData))

  const { data, isLoading } = useSWR(
    familyAgendaKey(studentId, dateStr),
    ([, sid, date]) => fetchFamilyAgendaDay(sid, date),
    {
      fallbackData: seed.payload,
      revalidateOnMount: !seed.alreadyFresh,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: FAMILY_AGENDA_DEDUP_MS,
      revalidateIfStale: !seed.alreadyFresh,
      onSuccess: (payload) => {
        writeFamilyAgendaCache(studentId, dateStr, payload, true)
      },
      onError: (err) => {
        void import('@/app/actions/audit').then(({ recordAuditError }) =>
          recordAuditError({
            action: 'error.family_agenda',
            entityType: 'daily_log',
            message: err instanceof Error ? err.message : String(err),
            context: { studentId, dateStr },
          })
        )
      },
    }
  )

  const payload = data ?? seed.payload

  if (!payload) {
    if (isLoading) {
      return <PageContentSkeleton variant="cards" />
    }
    return <FamilyAgendaView payload={emptyFamilyAgendaPayload()} />
  }

  return <FamilyAgendaView payload={payload} />
}
