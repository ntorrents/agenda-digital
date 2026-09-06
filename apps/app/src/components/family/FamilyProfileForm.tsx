'use client'

import { useState, useTransition } from 'react'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'
import { updateFamilyProfile } from '@/app/actions/family'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { setLocaleAction } from '@/app/actions/locale'
import { Locale } from '@/i18n'
import { cn } from '@/lib/utils'

export function FamilyProfileForm({
  profile,
  email,
  student,
}: {
  profile: any
  email: string | undefined
  student: any
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)

  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const currentLocale = useLocale() as Locale
  const t = useTranslations('familyProfile')

  const handleLanguageChange = (locale: Locale) => {
    if (locale === currentLocale) return
    startTransition(async () => {
      await setLocaleAction(locale)
      router.refresh()
    })
  }

  const languages = [
    { code: 'ca' as const, name: 'Català' },
    { code: 'es' as const, name: 'Castellano' },
    { code: 'en' as const, name: 'English' },
    { code: 'fr' as const, name: 'Français' },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget

    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg(false)

    try {
      const formData = new FormData(form)
      if (student) {
        formData.append('student_id', student.id)
      }

      const newPass = formData.get('new_password')
      const oldPass = formData.get('old_password')
      if (newPass && !oldPass) {
        throw new Error(t('passwordCurrentRequired'))
      }

      await updateFamilyProfile(formData)

      const oldPasswordInput = form.querySelector<HTMLInputElement>('input[name="old_password"]')
      const newPasswordInput = form.querySelector<HTMLInputElement>('input[name="new_password"]')
      if (oldPasswordInput) oldPasswordInput.value = ''
      if (newPasswordInput) newPasswordInput.value = ''

      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || t('errorGeneric'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {t('saved')}
        </div>
      )}

      <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs space-y-4">
        <h3 className="text-[11px] font-black uppercase text-stone-400 tracking-wider">
          {t('yourData')}
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('fullName')}</label>
          <input
            required
            name="full_name"
            defaultValue={profile.full_name}
            type="text"
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('phone')}</label>
          <input
            name="phone"
            defaultValue={profile.phone || ''}
            type="tel"
            placeholder={t('phonePlaceholder')}
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('email')}</label>
          <input
            required
            name="email"
            defaultValue={email || profile.email || ''}
            type="email"
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
          <p className="text-[10px] text-stone-400 pl-1">{t('emailHint')}</p>
        </div>
      </div>

      {student && (
        <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs space-y-4">
          <h3 className="text-[11px] font-black uppercase text-stone-400 tracking-wider">
            {t('personalization')}
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">{t('alias')}</label>
            <p className="text-[10px] text-stone-400 pl-1 mb-1">{t('aliasHint')}</p>
            <input
              name="alias"
              defaultValue={student.alias || ''}
              type="text"
              placeholder={`Ex: ${student.first_name}`}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs space-y-4">
        <h3 className="text-[11px] font-black uppercase text-stone-400 tracking-wider">
          {t('security')}
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('currentPassword')}</label>
          <input
            name="old_password"
            type="password"
            placeholder={t('currentPasswordPlaceholder')}
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('newPassword')}</label>
          <input
            name="new_password"
            type="password"
            placeholder={t('newPasswordPlaceholder')}
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-stone-200/80 rounded-[28px] p-5 shadow-xs space-y-4">
        <h3 className="text-[11px] font-black uppercase text-stone-400 tracking-wider">
          {t('languageTitle')}
        </h3>
        <p className="text-[10px] text-stone-400 pl-1 mb-1">{t('languageDesc')}</p>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isPending}
              className={cn(
                'py-3 px-4 text-sm font-bold rounded-2xl border transition-all cursor-pointer text-center',
                currentLocale === lang.code
                  ? 'bg-teal-50 border-teal-200 text-teal-700 font-extrabold'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              )}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-teal-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
      >
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        {t('saveChanges')}
      </button>
    </form>
  )
}
