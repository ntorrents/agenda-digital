'use client'

import { useState } from 'react'
import { Save, Loader2, User, Phone, FileText, HeartPulse, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createStudent, updateStudent } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Classroom {
  id: string
  name: string
  level: string
}

interface StudentDetailFormProps {
  classrooms: Classroom[]
  initialData?: any
}

export function StudentDetailForm({ classrooms, initialData }: StudentDetailFormProps) {
  const isEditing = !!initialData
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const t = useTranslations('studentForm')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    
    try {
      const formData = new FormData(e.currentTarget)
      
      if (isEditing) {
        formData.append('id', initialData.id)
        await updateStudent(formData)
      } else {
        await createStudent(formData)
      }
      
      router.push('/dashboard/config/alumnos')
    } catch (err: any) {
      setErrorMsg(err.message || t('errorTitle'))
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* Dades Bàsiques */}
      <div className="bg-white p-6 rounded-[28px] border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <User className="h-5 w-5 text-teal-600" />
          <h4 className="font-black text-stone-900">{t('sectionPersonal')}</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">{t('firstName')}</label>
            <input 
              required
              name="first_name"
              defaultValue={initialData?.first_name}
              type="text" 
              placeholder="Ex: Nil"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">{t('lastName')}</label>
            <input 
              required
              name="last_name"
              defaultValue={initialData?.last_name}
              type="text" 
              placeholder="Ex: Puig Valls"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">{t('birthDate')}</label>
            <input 
              required
              name="date_of_birth"
              defaultValue={initialData?.date_of_birth}
              type="date"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 pl-1">{t('gender')}</label>
            <select 
              name="gender"
              defaultValue={initialData?.gender || ''}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
            >
              <option value="">{t('genderNone')}</option>
              <option value="boy">{t('genderBoy')}</option>
              <option value="girl">{t('genderGirl')}</option>
              <option value="other">{t('genderOther')}</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('classroom')}</label>
          <select 
            name="classroom_id"
            defaultValue={initialData?.classroom_id || 'none'}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
          >
            <option value="none">{t('classroomNone')}</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dades Familiars */}
      <div className="bg-white p-6 rounded-[28px] border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Phone className="h-5 w-5 text-blue-600" />
          <h4 className="font-black text-stone-900">{t('sectionFamily')}</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-4 col-span-2">
              <h5 className="font-bold text-sm text-blue-700 pb-2 border-b border-blue-100">{t('tutor1')}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('fullName')}</label>
                  <input name="guardian_1_name" type="text" required placeholder={t('fullName')} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('relation')}</label>
                  <input name="guardian_1_relation" type="text" required placeholder={t('relationShort')} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('email')}</label>
                  <input name="guardian_1_email" type="email" required placeholder="correu@ejemplo.com" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('phone')}</label>
                  <input name="guardian_1_phone" type="text" required placeholder="600 000 000" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>

            <div className="space-y-4 col-span-2 pt-4">
              <h5 className="font-bold text-sm text-blue-700 pb-2 border-b border-blue-100">{t('tutor2')}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('fullName')}</label>
                  <input name="guardian_2_name" type="text" placeholder={t('fullName')} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('relationShort')}</label>
                  <input name="guardian_2_relation" type="text" placeholder={t('relationShort')} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('email')}</label>
                  <input name="guardian_2_email" type="email" placeholder="correu2@ejemplo.com" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('phone')}</label>
                  <input name="guardian_2_phone" type="text" placeholder="600 000 000" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>
          <div className="space-y-1.5 col-span-2 pt-4">
            <label className="text-xs font-bold text-stone-500 pl-1">{t('authorized')}</label>
            <input 
              name="authorized_pickup"
              defaultValue={initialData?.authorized_pickup}
              type="text" 
              placeholder="Ex: Avis paterns, Tieta"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Salut i Al·lèrgies */}
      <div className="bg-white p-6 rounded-[28px] border border-rose-200 shadow-xs space-y-6 bg-rose-50/10">
        <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
          <HeartPulse className="h-5 w-5 text-rose-600" />
          <h4 className="font-black text-stone-900">{t('sectionHealth')}</h4>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-rose-700 pl-1 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5"/> {t('intolerances')}</label>
          <textarea 
            name="intolerances"
            defaultValue={initialData?.intolerances || ''}
            placeholder={t('intolerancesPlaceholder')}
            className="w-full h-24 bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* Notes Internes */}
      <div className="bg-white p-6 rounded-[28px] border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <FileText className="h-5 w-5 text-amber-600" />
          <h4 className="font-black text-stone-900">{t('sectionNotes')}</h4>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 pl-1">{t('notes')}</label>
          <textarea 
            name="internal_notes"
            defaultValue={initialData?.internal_notes || ''}
            placeholder={t('notesPlaceholder')}
            className="w-full h-24 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* Action Area */}
      <div className="sticky bottom-4 z-10 flex items-center gap-3 p-4 bg-white/90 backdrop-blur-xl border border-stone-200/80 rounded-[24px] shadow-xl">
        <Button 
          type="button"
          onClick={() => router.back()}
          variant="outline"
          className="flex-1 h-12 rounded-xl text-stone-600 font-bold border-stone-200 hover:bg-stone-100"
        >
          {t('cancel')}
        </Button>
        <Button 
          type="submit"
          disabled={isSaving}
          className="flex-[2] h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-md cursor-pointer"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEditing ? t('save') : t('enroll'))}
        </Button>
      </div>

    </form>
  )
}
