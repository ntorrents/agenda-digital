'use client'

import { useState } from 'react'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateSchoolSettings } from '@/app/actions/school'

export function SchoolSettingsForm({ initialSettings, schoolInfo }: { initialSettings: any, schoolInfo: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)

  // Default structure
  const settings = {
    opening_time: initialSettings?.opening_time || '07:30',
    closing_time: initialSettings?.closing_time || '18:00',
    dining_service: initialSettings?.dining_service ?? true,
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
        dining_service: formData.get('dining_service') === 'on',
      }

      const payload = new FormData()
      payload.append('settings', JSON.stringify(newSettings))
      payload.append('cif', formData.get('cif') as string)
      payload.append('contact_email', formData.get('contact_email') as string)
      payload.append('name', formData.get('name') as string)
      payload.append('address', formData.get('address') as string)

      await updateSchoolSettings(payload)
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || "Error a l'operació")
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
          <CheckCircle2 className="h-4 w-4" /> Paràmetres desats correctament
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Nom del Centre</label>
          <input 
            required
            name="name"
            defaultValue={schoolInfo?.name}
            type="text" 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Adreça</label>
          <input 
            name="address"
            defaultValue={schoolInfo?.address}
            type="text" 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">CIF / NIF</label>
            <input 
              name="cif"
              defaultValue={schoolInfo?.cif}
              type="text" 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">Correu de contacte</label>
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
          <label className="text-xs font-bold text-stone-500 pl-1">Hora d&apos;obertura</label>
          <input 
            required
            name="opening_time"
            defaultValue={settings.opening_time}
            type="time" 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">Hora de tancament</label>
          <input 
            required
            name="closing_time"
            defaultValue={settings.closing_time}
            type="time" 
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
        <input 
          type="checkbox"
          name="dining_service"
          defaultChecked={settings.dining_service}
          id="dining_service"
          className="h-5 w-5 rounded border-stone-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
        />
        <label htmlFor="dining_service" className="text-sm font-bold text-stone-800 cursor-pointer select-none">
          Servei de Menjador Actiu
        </label>
      </div>

      <Button 
        type="submit"
        disabled={isSaving}
        className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer mt-4 flex items-center justify-center gap-2"
      >
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-4 w-4" />} 
        Desar Configuració
      </Button>
    </form>
  )
}
