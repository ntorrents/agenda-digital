'use client'

import { Smile, Meh, Frown, Angry } from 'lucide-react'
import { PillSelector, type PillOption } from '@/components/shared/PillSelector'
import type { Mood } from '@/types/enums'
import { useTranslations } from 'next-intl'

interface MoodSelectorProps {
  value: Mood | null
  onChange: (value: Mood) => void
  className?: string
}

export function MoodSelector({ value, onChange, className }: MoodSelectorProps) {
  const t = useTranslations('mood')
  const tLog = useTranslations('dailyLog')

  const options: PillOption<Mood>[] = [
    { value: 'happy', label: t('happy'), icon: <Smile className="h-4 w-4" /> },
    { value: 'calm', label: t('calm'), icon: <Meh className="h-4 w-4" /> },
    { value: 'sad', label: t('sad'), icon: <Frown className="h-4 w-4" /> },
    { value: 'irritable', label: t('irritable'), icon: <Angry className="h-4 w-4" /> },
  ]

  return (
    <PillSelector
      options={options}
      value={value}
      onChange={onChange}
      colorScheme="teal"
      label={tLog('mood')}
      className={className}
    />
  )
}
