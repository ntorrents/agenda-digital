'use client'

import { useState, useRef } from 'react'
import { Building2, Plus, ChevronDown, ChevronUp, Trash2, Save, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveAllClassrooms, archiveClassroom } from './actions'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type Classroom = {
  id: string
  name: string
  level: string
  capacity: number | string | null
  teacher_id: string | null
  auxiliary_teacher_ids?: string[]
  _isNew?: boolean
  _isArchived?: boolean
}

type AulasEditorProps = {
  initialClassrooms: Classroom[]
  teachers: { id: string, full_name: string }[]
  schoolId: string
}

export function AulasEditor({ initialClassrooms, teachers, schoolId }: AulasEditorProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Archiving states
  const [classroomToArchive, setClassroomToArchive] = useState<Classroom | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)
  const t = useTranslations('dashboardAulas')
  const listTopRef = useRef<HTMLDivElement>(null)

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const updateClassroom = (id: string, field: keyof Classroom, value: any) => {
    setClassrooms(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
    setHasChanges(true)
  }

  const addNewClassroom = () => {
    const newId = `new-${Date.now()}`
    const newRoom: Classroom = {
      id: newId,
      name: t('newClassroomDefault'),
      level: 'I0',
      capacity: 10,
      teacher_id: null,
      auxiliary_teacher_ids: [],
      _isNew: true,
    }
    setClassrooms(prev => [newRoom, ...prev])
    setExpandedIds(prev => ({ ...prev, [newId]: true }))
    setHasChanges(true)
    setTimeout(() => listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    const result = await saveAllClassrooms(classrooms, schoolId)
    setIsSaving(false)
    if (result.success) {
      setHasChanges(false)
      // Actualizamos estado quitando el "_isNew" para que ya no sea nueva
      setClassrooms(prev => prev.map(c => ({ ...c, _isNew: false })))
    } else {
      alert(result.error)
    }
  }

  const handleArchive = async () => {
    if (!classroomToArchive) return
    
    // Si es nueva (no está en BD), simplemente la borramos del estado
    if (classroomToArchive._isNew) {
      setClassrooms(prev => prev.filter(c => c.id !== classroomToArchive.id))
      setClassroomToArchive(null)
      setHasChanges(true)
      return
    }

    setIsArchiving(true)
    const result = await archiveClassroom(classroomToArchive.id)
    setIsArchiving(false)
    
    if (result.success) {
      setClassrooms(prev => prev.filter(c => c.id !== classroomToArchive.id))
      setClassroomToArchive(null)
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
        
        <Button onClick={addNewClassroom} variant="outline" className="rounded-xl border-stone-200 font-bold bg-white text-stone-600 hover:bg-stone-50">
          <Plus className="h-4 w-4 mr-2" /> {t('add')}
        </Button>
      </div>

      {/* Lista de Aulas */}
      <div className="space-y-4" ref={listTopRef}>
        {classrooms.map((aula) => {
          const isExpanded = expandedIds[aula.id] || false
          
          return (
            <div key={aula.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm transition-all">
              
              {/* Header (siempre visible) */}
              <div 
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50/50 transition-colors",
                  isExpanded ? "border-b border-stone-100" : ""
                )}
                onClick={() => toggleExpand(aula.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900 text-lg">
                      {aula.name || t('untitled')}
                    </h4>
                    <p className="text-xs font-bold text-stone-400">
                      {t('level')} {aula.level} {aula.capacity ? `· ${aula.capacity} ${t('places')}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setClassroomToArchive(aula) }}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity duration-300">
                    
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        {t('nameLabel')}
                      </label>
                      <input
                        type="text"
                        value={aula.name}
                        onChange={(e) => updateClassroom(aula.id, 'name', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-600"
                        placeholder={t('namePlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        {t('levelLabel')}
                      </label>
                      <select
                        value={aula.level}
                        onChange={(e) => updateClassroom(aula.id, 'level', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-600"
                      >
                        <option value="I0">I0 (0-1 anys)</option>
                        <option value="I1">I1 (1-2 anys)</option>
                        <option value="I2">I2 (2-3 anys)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        {t('capacityLabel')}
                      </label>
                      <input
                        type="number"
                        value={aula.capacity || ''}
                        onChange={(e) => updateClassroom(aula.id, 'capacity', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-600"
                        placeholder={t('capacityPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        {t('tutorLabel')}
                      </label>
                      <select
                        value={aula.teacher_id || ''}
                        onChange={(e) => updateClassroom(aula.id, 'teacher_id', e.target.value || null)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-600"
                      >
                        <option value="">{t('tutorUnassigned')}</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.full_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        Equip Auxiliar (Múltiple)
                      </label>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto bg-stone-50 p-3 rounded-xl border border-stone-200">
                        {teachers.map(t => (
                          <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-stone-100 p-1 rounded-md transition-colors">
                            <input
                              type="checkbox"
                              checked={(aula.auxiliary_teacher_ids || []).includes(t.id)}
                              onChange={(e) => {
                                const currentIds = aula.auxiliary_teacher_ids || [];
                                let newIds;
                                if (e.target.checked) {
                                  newIds = [...currentIds, t.id];
                                } else {
                                  newIds = currentIds.filter(id => id !== t.id);
                                }
                                updateClassroom(aula.id, 'auxiliary_teacher_ids', newIds);
                              }}
                              className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600"
                            />
                            <span className="text-sm font-medium text-stone-700">{t.full_name}</span>
                          </label>
                        ))}
                        {teachers.length === 0 && (
                          <span className="text-sm text-stone-400">Cap educadora disponible</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )
        })}

        {classrooms.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 border-dashed">
            <Building2 className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">{t('noAulasTitle')}</h3>
            <p className="text-sm text-stone-500 mt-1 mb-4">{t('noAulasDesc')}</p>
            <Button onClick={addNewClassroom} className="bg-teal-600 hover:bg-teal-700 font-bold rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> {t('create')}
            </Button>
          </div>
        )}
      </div>

      {/* Flotante Guardar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <span className="text-sm font-bold pl-2">{t('pendingChanges')}</span>
            <Button 
              onClick={handleSaveAll}
              disabled={isSaving} 
              className="bg-teal-500 hover:bg-teal-400 text-stone-900 rounded-xl font-black shadow-none border-none h-9"
            >
              {isSaving ? t('saving') : t('saveAll')}
            </Button>
          </div>
        </div>
      )}

      {/* Modal Archivar */}
      {classroomToArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h3 className="text-xl font-black text-center text-stone-900 mb-2">
              {t('archiveTitle')}
            </h3>
            <p className="text-sm text-center text-stone-500 mb-8 leading-relaxed">
              {t('archiveDesc1')} <strong>{classroomToArchive.name}</strong>. {t('archiveDesc2')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="w-full sm:flex-1 rounded-xl font-bold h-12 order-2 sm:order-1"
                onClick={() => setClassroomToArchive(null)}
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
