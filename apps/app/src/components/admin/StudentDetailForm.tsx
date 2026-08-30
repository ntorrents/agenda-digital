'use client'

import { useState } from 'react'
import { Save, Loader2, User, Phone, FileText, HeartPulse, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createStudent, updateStudent } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { SendAccessButton } from '@/components/admin/SendAccessButton'

interface Classroom {
  id: string
  name: string
  level: string
}

interface GuardianProfile {
  id: string
  full_name: string
  email: string
  phone: string
  welcome_email_sent: boolean
}

interface GuardianRelation {
  guardian_id: string
  relation: string
  profiles: GuardianProfile | null
}

interface StudentDetailFormProps {
  classrooms: Classroom[]
  initialData?: any
  guardians?: GuardianRelation[]
}

export function StudentDetailForm({ classrooms, initialData, guardians = [] }: StudentDetailFormProps) {
  const isEditing = !!initialData
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const t = useTranslations('studentForm')

  const getProfile = (guardian?: GuardianRelation) => {
    if (!guardian) return null
    if (Array.isArray(guardian.profiles)) return guardian.profiles[0]
    return guardian.profiles
  }

  const p1 = getProfile(guardians[0])
  const p2 = getProfile(guardians[1])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    
    try {
      const formData = new FormData(e.currentTarget)
      
      if (isEditing) {
        formData.append('id', initialData.id)
        await updateStudent(formData)
        router.refresh()
        setIsSaving(false)
      } else {
        await createStudent(formData)
        router.push('/dashboard/config/alumnos')
      }
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
              <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                <h5 className="font-bold text-sm text-blue-700">{t('tutor1')}</h5>
                {guardians[0] && p1 && (
                  <>
                    <input type="hidden" name="guardian_1_id" value={p1.id} />
                    <SendAccessButton 
                      userId={p1.id} 
                      email={p1.email} 
                      alreadySent={p1.welcome_email_sent} 
                    />
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('fullName')}</label>
                  <input name="guardian_1_name" type="text" required placeholder={t('fullName')} defaultValue={p1?.full_name || ''} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('relation')}</label>
                  <select name="guardian_1_relation" required defaultValue={guardians[0]?.relation || 'father'} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    <option value="mother">{t('relationMother')}</option>
                    <option value="father">{t('relationFather')}</option>
                    <option value="tutor">{t('relationTutor')}</option>
                    <option value="other">{t('relationOther')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('email')}</label>
                  <input name="guardian_1_email" type="email" required placeholder="correu@ejemplo.com" defaultValue={p1?.email || ''} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('phone')}</label>
                  <input name="guardian_1_phone" type="text" placeholder="600 000 000" defaultValue={p1?.phone || ''} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>

            <div className="space-y-4 col-span-2 pt-4">
              <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                <h5 className="font-bold text-sm text-blue-700">{t('tutor2')}</h5>
                {guardians[1] && p2 && (
                  <>
                    <input type="hidden" name="guardian_2_id" value={p2.id} />
                    <SendAccessButton 
                      userId={p2.id} 
                      email={p2.email} 
                      alreadySent={p2.welcome_email_sent} 
                    />
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('fullName')}</label>
                  <input name="guardian_2_name" type="text" placeholder={t('fullName')} defaultValue={p2?.full_name || ''} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('relationShort')}</label>
                  <select name="guardian_2_relation" defaultValue={guardians[1]?.relation || ''} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                    <option value="">{t('genderNone')}</option>
                    <option value="mother">{t('relationMother')}</option>
                    <option value="father">{t('relationFather')}</option>
                    <option value="tutor">{t('relationTutor')}</option>
                    <option value="other">{t('relationOther')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('email')}</label>
                  <input name="guardian_2_email" type="email" placeholder="correu2@ejemplo.com" defaultValue={p2?.email || ''} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 pl-1">{t('phone')}</label>
                  <input name="guardian_2_phone" type="text" placeholder="600 000 000" defaultValue={p2?.phone || ''} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
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
