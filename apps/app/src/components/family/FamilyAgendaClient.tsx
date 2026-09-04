'use client'

import useSWR from 'swr'
import {
  fetchFamilyAgendaDay,
  type FamilyAgendaPayload,
} from '@/app/actions/family-agenda'
import { FamilyAgendaView } from '@/components/family/FamilyAgendaView'

const AGENDA_DEDUP_MS = 5 * 60 * 1000 // 5 min

type Props = {
  studentId: string
  dateStr: string
  fallbackData: FamilyAgendaPayload
}

export function FamilyAgendaClient({ studentId, dateStr, fallbackData }: Props) {
  const { data } = useSWR(
    ['family-agenda', studentId, dateStr] as const,
    ([, sid, date]) => fetchFamilyAgendaDay(sid, date),
    {
      fallbackData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: AGENDA_DEDUP_MS,
      revalidateIfStale: false,
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

  return <FamilyAgendaView payload={data ?? fallbackData} />
}
