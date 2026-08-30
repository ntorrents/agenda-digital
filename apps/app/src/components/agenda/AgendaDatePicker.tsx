'use client'

import { DatePickerNav } from '@/components/ui/DatePickerNav'

export function AgendaDatePicker({ currentDate }: { currentDate: string }) {
  return <DatePickerNav currentDate={currentDate} variant="default" />
}
