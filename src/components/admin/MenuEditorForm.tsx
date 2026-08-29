'use client'

import { useState } from 'react'
import { Save, Loader2, Image as ImageIcon, Upload, FileText } from 'lucide-react'
import { upsertMenu } from '@/app/actions/menu'

export function MenuEditorForm({ currentMonth, currentYear, existingMenu }: { currentMonth: number, currentYear: number, existingMenu: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)
  
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('L\'arxiu és massa gran. El límit és 10MB.')
      return
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setFilePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      // Es un PDF u otro doc
      setFilePreview('pdf')
    }
    setErrorMsg('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg(false)
    
    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      formData.append('month', currentMonth.toString())
      formData.append('year', currentYear.toString())
      
      await upsertMenu(formData)
      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error guardant el menú')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-200">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200">
          Menú desat correctament
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-[28px] p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-bold text-stone-700">Títol (Opcional)</label>
          <input 
            type="text"
            name="title"
            defaultValue={existingMenu?.title || `Menú de ${new Date(currentYear, currentMonth - 1).toLocaleString('ca', { month: 'long' })}`}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-stone-700">Descripció o Detalls (Opcional)</label>
          <textarea 
            name="description"
            rows={4}
            defaultValue={existingMenu?.description || ''}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-stone-800 focus:outline-none focus:border-teal-500 resize-none"
            placeholder="Escriu aquí el menú si no vols pujar cap imatge..."
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-stone-700">Imatge o PDF del menú (Opcional)</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 border-dashed">
            
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl bg-white border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
              {(filePreview && filePreview !== 'pdf') || (existingMenu?.file_url && !existingMenu.file_url.endsWith('.pdf')) ? (
                <img 
                  src={filePreview && filePreview !== 'pdf' ? filePreview : existingMenu?.file_url} 
                  alt="Menu preview" 
                  className="w-full h-full object-cover" 
                />
              ) : (filePreview === 'pdf' || (existingMenu?.file_url && existingMenu.file_url.endsWith('.pdf'))) ? (
                <FileText className="h-10 w-10 text-rose-500" />
              ) : (
                <ImageIcon className="h-8 w-8 text-stone-300" />
              )}
            </div>

            <div className="space-y-3 flex-1 w-full">
              <input 
                type="file"
                name="file"
                id="file-upload"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
              <label 
                htmlFor="file-upload"
                className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-bold cursor-pointer hover:bg-stone-50 transition-colors w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                Pujar Arxiu
              </label>
              <p className="text-xs text-stone-500 leading-relaxed">
                Pots pujar una imatge (JPG, PNG) o un document PDF. Aquest serà visible per totes les famílies de l'escola durant aquest mes.
              </p>
            </div>

          </div>
        </div>
      </div>

      <button 
        type="submit"
        disabled={isSaving}
        className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-base shadow-md shadow-teal-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
      >
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} 
        Desar Menú del Mes
      </button>

    </form>
  )
}
