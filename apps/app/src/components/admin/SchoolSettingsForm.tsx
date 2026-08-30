'use client'

import { useState, useRef } from 'react'
import { Save, Loader2, CheckCircle2, Image as ImageIcon, Upload, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateSchoolSettings } from '@/app/actions/school'
import { useTranslations } from 'next-intl'

export function SchoolSettingsForm({ initialSettings, schoolInfo }: { initialSettings: any, schoolInfo: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('schoolSettings')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(t('fileTooBig'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => setLogoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setErrorMsg('')
  }

  // Default structure
  const settings = {
    opening_time: initialSettings?.opening_time || '07:30',
    closing_time: initialSettings?.closing_time || '18:00',
    agenda_food: initialSettings?.agenda_food ?? true,
    agenda_nap: initialSettings?.agenda_nap ?? true,
    agenda_diaper: initialSettings?.agenda_diaper ?? true,
    agenda_mood: initialSettings?.agenda_mood ?? true,
    ...initialSettings
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg(false)
    
    try {
      const formData = new FormData(e.currentTarget)
      
      const newSettings = {
        opening_time: formData.get('opening_time'),
        closing_time: formData.get('closing_time'),
        agenda_food: formData.get('agenda_food') === 'on',
        agenda_nap: formData.get('agenda_nap') === 'on',
        agenda_diaper: formData.get('agenda_diaper') === 'on',
        agenda_mood: formData.get('agenda_mood') === 'on',
      }

      const payload = new FormData()
      payload.append('settings', JSON.stringify(newSettings))
      payload.append('cif', formData.get('cif') as string)
      payload.append('contact_email', formData.get('contact_email') as string)
      payload.append('name', formData.get('name') as string)
      payload.append('address', formData.get('address') as string)
      
      const logoFile = formData.get('logo') as File | null
      if (logoFile && logoFile.size > 0) {
        payload.append('logo', logoFile)
      }

      await updateSchoolSettings(payload)
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || t('errorTitle'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg bg-white p-6 rounded-[28px] border border-stone-200/80 shadow-xs">
      
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
          {errorMsg}
        </div>
      )}
      
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {t('successMsg')}
        </div>
      )}

      <div className="space-y-4">
        {/* Logo de la escuela */}
        <div className="space-y-3 pb-4 border-b border-stone-100">
          <label className="text-xs font-bold text-stone-500 pl-1 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-stone-400" />
            {t('labelLogo')}
          </label>
          
          <div className="flex items-center gap-6">
            <div className="relative h-20 w-20 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden shrink-0 group">
              {(logoPreview || schoolInfo?.logo_url) ? (
                <img 
                  src={logoPreview || schoolInfo?.logo_url} 
                  alt="Logo preview" 
                  className="max-h-full max-w-full object-contain p-2" 
                />
              ) : (
                <Building className="h-8 w-8 text-stone-300" />
              )}
            </div>
            
            <div className="space-y-2 flex-1">
              <input 
                type="file"
                name="logo"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl h-9 border-stone-200 text-stone-600 hover:text-stone-900 font-bold text-xs bg-white"
              >
                <Upload className="h-3 w-3 mr-2" />
                {t('btnUpload')}
              </Button>
              <p className="text-[10px] font-medium text-stone-400 leading-tight">
                {t('logoFormat')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('labelName')}</label>
          <input 
            required
            name="name"
            defaultValue={schoolInfo?.name}
            type="text" 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('labelAddress')}</label>
          <input 
            name="address"
            defaultValue={schoolInfo?.address}
            type="text" 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">{t('labelCif')}</label>
            <input 
              name="cif"
              defaultValue={schoolInfo?.cif}
              type="text" 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">{t('labelContactEmail')}</label>
            <input 
              name="contact_email"
              defaultValue={schoolInfo?.contact_email}
              type="email" 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>
      <hr className="border-stone-100" />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('labelOpeningTime')}</label>
          <input 
            required
            name="opening_time"
            defaultValue={settings.opening_time}
            type="time" 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('labelClosingTime')}</label>
          <input 
            required
            name="closing_time"
            defaultValue={settings.closing_time}
            type="time" 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black text-stone-800 border-b border-stone-100 pb-2">{t('agendaOptionsTitle')}</h3>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/80">
            <input 
              type="checkbox"
              name="agenda_food"
              defaultChecked={settings.agenda_food}
              id="agenda_food"
              className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
            />
            <label htmlFor="agenda_food" className="text-sm font-bold text-stone-800 cursor-pointer select-none">
              {t('foodOption')}
            </label>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/80">
            <input 
              type="checkbox"
              name="agenda_nap"
              defaultChecked={settings.agenda_nap}
              id="agenda_nap"
              className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
            />
            <label htmlFor="agenda_nap" className="text-sm font-bold text-stone-800 cursor-pointer select-none">
              {t('napOption')}
            </label>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/80">
            <input 
              type="checkbox"
              name="agenda_diaper"
              defaultChecked={settings.agenda_diaper}
              id="agenda_diaper"
              className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
            />
            <label htmlFor="agenda_diaper" className="text-sm font-bold text-stone-800 cursor-pointer select-none">
              {t('diaperOption')}
            </label>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200/80">
            <input 
              type="checkbox"
              name="agenda_mood"
              defaultChecked={settings.agenda_mood}
              id="agenda_mood"
              className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
            />
            <label htmlFor="agenda_mood" className="text-sm font-bold text-stone-800 cursor-pointer select-none">
              {t('moodOption')}
            </label>
          </div>
        </div>
        <p className="text-[10px] text-stone-500 font-medium pt-1">
          {t('optionsNote')}
        </p>
      </div>

      <Button 
        type="submit"
        disabled={isSaving}
        className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer mt-4 flex items-center justify-center gap-2"
      >
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-4 w-4" />} 
        {t('btnSave')}
      </Button>
    </form>
  )
}
