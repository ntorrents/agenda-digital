'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, ChevronDown, ChevronUp, Trash2, Save, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveAllStaff, archiveStaffMember } from './actions'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { SendAccessButton } from '@/components/admin/SendAccessButton'

type StaffMember = {
  id: string
  school_id?: string
  full_name: string
  role: string
  email: string
  phone?: string | null
  status?: string
  welcome_email_sent?: boolean
  _isNew?: boolean
}

type EquipoEditorProps = {
  initialStaff: StaffMember[]
  schoolId: string
}

export function EquipoEditor({ initialStaff, schoolId }: EquipoEditorProps) {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [memberToArchive, setMemberToArchive] = useState<StaffMember | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)
  const t = useTranslations('dashboardEquipo')

  const listTopRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasChanges) {
      setStaff(initialStaff)
    }
  }, [initialStaff, hasChanges])

  // Initialize expanded state based on desktop/mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        const newExpanded: Record<string, boolean> = {}
        staff.forEach(s => {
          newExpanded[s.id] = true
        })
        setExpandedIds(prev => Object.keys(prev).length > 0 ? prev : newExpanded)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [staff])

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const updateMember = (id: string, field: keyof StaffMember, value: any) => {
    setStaff(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
    setHasChanges(true)
  }

  const addNewMember = () => {
    const newId = `new-${Date.now()}`
    const newMember: StaffMember = {
      id: newId,
      school_id: schoolId,
      full_name: '',
      role: 'teacher',
      email: '',
      phone: '',
      status: 'active',
      _isNew: true,
    }
    setStaff(prev => [newMember, ...prev])
    setExpandedIds(prev => ({ ...prev, [newId]: true }))
    setHasChanges(true)
    setTimeout(() => listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handleSaveAll = async () => {
    // Validar emails de los nuevos
    if (staff.some(s => s._isNew && !s.email)) {
      alert(t('validationEmailRequired'))
      return
    }

    setIsSaving(true)
    const result = await saveAllStaff(staff)
    setIsSaving(false)
    
    if (result.success) {
      setHasChanges(false)
      setStaff((prev) =>
        prev
          .map((s) => ({ ...s, _isNew: false }))
          .filter((s) => s.status !== 'inactive')
      )
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleArchive = async () => {
    if (!memberToArchive) return
    
    if (memberToArchive._isNew) {
      setStaff(prev => prev.filter(s => s.id !== memberToArchive.id))
      setMemberToArchive(null)
      setHasChanges(true)
      return
    }

    setIsArchiving(true)
    const result = await archiveStaffMember(memberToArchive.id)
    setIsArchiving(false)
    
    if (result.success) {
      setStaff(prev => prev.filter(s => s.id !== memberToArchive.id))
      setMemberToArchive(null)
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      
      {/* Botón de añadir y mensaje de cambios */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {hasChanges ? (
          <p className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            {t('unsavedChanges')}
          </p>
        ) : (
          <p className="text-sm text-stone-500 font-medium">{t('allSaved')}</p>
        )}
        
        <Button onClick={addNewMember} variant="outline" className="rounded-xl border-stone-200 font-bold bg-white text-stone-600 hover:bg-stone-50">
          <Plus className="h-4 w-4 mr-2" /> {t('addMember')}
        </Button>
      </div>

      {/* Lista */}
      <div className="space-y-4" ref={listTopRef}>
        {staff.map((member) => {
          const isExpanded = expandedIds[member.id] || false
          
          return (
            <div key={member.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm transition-all">
              
              <div 
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50/50 transition-colors",
                  isExpanded ? "border-b border-stone-100" : ""
                )}
                onClick={() => toggleExpand(member.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900 text-lg">
                      {member.full_name || t('noName')}
                    </h4>
                    <p className="text-xs font-bold text-stone-400">
                      {member.role === 'admin'
                        ? t('roleAdmin')
                        : member.role === 'auxiliary'
                          ? t('roleAuxiliary')
                          : t('roleTeacher')}{' '}
                      {member.email ? `· ${member.email}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setMemberToArchive(member) }}
                    className="p-2 rounded-lg text-stone-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="p-1">
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
                  </div>
                </div>
              </div>

              {/* Contenido (Expandible) */}
              {isExpanded && (
                <div className="p-4 sm:p-6 bg-stone-50/30">
                  <div className="mb-4">
                    {!member._isNew && member.email && (
                      <SendAccessButton 
                        userId={member.id} 
                        email={member.email} 
                        alreadySent={!!member.welcome_email_sent} 
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity duration-300">
                    
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        {t('labelFullName')}
                      </label>
                      <input
                        type="text"
                        value={member.full_name}
                        onChange={(e) => updateMember(member.id, 'full_name', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-600"
                        placeholder={t('placeholderName')}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        {t('labelRole')}
                      </label>
                      <select
                        value={member.role}
                        onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-600"
                      >
                        <option value="teacher">{t('roleTeacher')}</option>
                        <option value="auxiliary">{t('roleAuxiliary')}</option>
                        <option value="admin">{t('roleAdminSelect')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        {t('labelEmail')}
                      </label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                        disabled={!member._isNew} // Solo se puede cambiar al crearlo
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-100"
                        placeholder={t('emailPlaceholder')}
                      />
                      {!member._isNew && (
                        <p className="text-[9px] text-stone-400 mt-1">{t('emailNote')}</p>
                      )}
                      {member._isNew && (
                        <p className="text-[9px] text-indigo-600 font-bold mt-1">{t('defaultPwdNote')}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        {t('labelPhone')}
                      </label>
                      <input
                        type="text"
                        value={member.phone || ''}
                        onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-600"
                        placeholder={t('placeholderPhone')}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        {t('labelStatus')}
                      </label>
                      <select
                        value={member.status || 'active'}
                        onChange={(e) => updateMember(member.id, 'status', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-600"
                      >
                        <option value="active">{t('statusActive')}</option>
                        <option value="paused">{t('statusPaused')}</option>
                        <option value="inactive">{t('statusInactive')}</option>
                      </select>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Flotante Guardar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <span className="text-sm font-bold pl-2">{t('pendingChanges')}</span>
            <Button 
              onClick={handleSaveAll}
              disabled={isSaving} 
              className="bg-indigo-500 hover:bg-indigo-400 text-stone-900 rounded-xl font-black shadow-none border-none h-9"
            >
              {isSaving ? t('saving') : t('saveAll')}
            </Button>
          </div>
        </div>
      )}

      {/* Modal Archivar */}
      {memberToArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h3 className="text-xl font-black text-center text-stone-900 mb-2">
              {t('archiveTitle')}
            </h3>
            <p className="text-sm text-center text-stone-500 mb-8 leading-relaxed">
              {t('archiveDesc1')} <strong>{memberToArchive.full_name}</strong>. {t('archiveDesc2')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="w-full sm:flex-1 rounded-xl font-bold h-12 order-2 sm:order-1"
                onClick={() => setMemberToArchive(null)}
                disabled={isArchiving}
              >
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleArchive} 
                className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold h-12 order-1 sm:order-2"
                disabled={isArchiving}
              >
                {isArchiving ? t('archiving') : t('archiveConfirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
