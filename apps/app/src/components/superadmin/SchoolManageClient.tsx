'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  archiveStaffMember,
  archiveStudent,
  createClassroom,
  createStaffMember,
  createStudent,
  deleteClassroom,
  deleteSchool,
  updateClassroom,
  updateSchoolBilling,
  updateSchoolIdentity,
  updateStaffMember,
  updateStudent,
} from '@/app/superadmin/actions'
import { DEFAULT_STAFF_PASSWORD } from '@/lib/superadmin-constants'
import {
  getEffectivePricePerStudent,
  getSchoolMonthlyPrice,
  getSchoolMrr,
  isSchoolBillingActive,
} from '@/lib/superadmin-billing'
import { SaSendAccessButton } from './SaSendAccessButton'
import { SaImpersonateButton } from './SaImpersonateButton'
import { SchoolCommercialTab } from './SchoolCommercialTab'
import { OnboardingPanel } from './OnboardingPanel'
import type { CommercialSettings, BillingEvent, SchoolDocument, SchoolInvoice } from '@/lib/superadmin-commercial'
import type { OnboardingStep } from '@/lib/superadmin-onboarding'
import {
  SaButton,
  SaField,
  SaInput,
  SaMessage,
  SaPanel,
  SaPanelHeader,
  SaSelect,
  SaTable,
  SaTabs,
  SaTextarea,
} from './sa-ui'

type School = {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  email: string | null
  cif: string | null
  contact_email: string | null
  created_at: string
  settings: Record<string, unknown> | null
}

type Classroom = {
  id: string
  name: string
  level: string
  capacity: number | null
  teacher_id: string | null
  status: string
}

type Staff = {
  id: string
  full_name: string
  email: string
  role: string
  phone: string | null
  status: string
  welcome_email_sent?: boolean
}

type StudentGuardian = {
  id?: string
  full_name: string | null
  email: string | null
  phone: string | null
  relation: string
}

type Student = {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  classroom_id: string | null
  status: string
  guardians?: StudentGuardian[]
}

const TABS = [
  { id: 'resum', label: 'Resum' },
  { id: 'dades', label: 'Dades' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'aules', label: 'Aules' },
  { id: 'personal', label: 'Personal' },
  { id: 'alumnes', label: 'Alumnes' },
]

export function SchoolManageClient({
  school,
  classrooms,
  staff,
  students,
  stats,
  commercial,
  documents,
  invoices,
  billingEvents,
  erpTablesMissing,
  onboarding,
}: {
  school: School
  classrooms: Classroom[]
  staff: Staff[]
  students: Student[]
  stats: { activeStudents: number; staffCount: number; classroomsCount: number }
  commercial: CommercialSettings
  documents: SchoolDocument[]
  invoices: SchoolInvoice[]
  billingEvents: BillingEvent[]
  erpTablesMissing: boolean
  onboarding: { steps: OnboardingStep[]; progress: number; ready: boolean }
}) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab')
  const [tab, setTab] = useState(() => (initialTab && TABS.some((t) => t.id === initialTab) ? initialTab : 'resum'))

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t && TABS.some((x) => x.id === t)) setTab(t)
  }, [searchParams])
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const settings = (school.settings || {}) as {
    billing?: { notes?: string; monthly_price?: number }
    ops?: { active?: boolean }
  }
  const monthlyPrice = getSchoolMonthlyPrice(school.settings)
  const billingActive = isSchoolBillingActive(school.settings)
  const mrr = getSchoolMrr(school.settings)
  const effectivePerStudent = getEffectivePricePerStudent(monthlyPrice, stats.activeStudents)

  function run(action: () => Promise<{ error?: string; success?: boolean; tempPassword?: string; emailSent?: boolean }>, okMsg: string) {
    startTransition(async () => {
      const result = await action()
      if (result.error && !result.success) {
        setMessage({ type: 'err', text: result.error })
        return
      }
      let text = okMsg
      if (result.tempPassword) text += ` Contrasenya temporal: ${result.tempPassword}`
      if (result.emailSent) text += ' Correu d\'accés enviat.'
      if (result.error && result.success) text += ` (${result.error})`
      setMessage({ type: result.error && result.success ? 'err' : 'ok', text })
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Link href="/superadmin/escoles" className="text-xs text-stone-500 hover:text-stone-300">
            ← Escoles
          </Link>
          <h2 className="text-xl font-black text-white mt-1">{school.name}</h2>
          <p className="text-xs text-stone-500">
            {school.slug}
            <span className="text-stone-600 ml-2 font-mono" title={school.id}>
              ref.{school.id.slice(0, 8)}
            </span>
          </p>
        </div>
        <div className="text-right text-sm">
          <div className="text-stone-400">Quota mensual</div>
          <div className="text-2xl font-black text-emerald-400">
            {billingActive ? `${mrr} €` : '—'}
          </div>
          {billingActive && effectivePerStudent != null && (
            <div className="text-[11px] text-stone-500">
              ~{effectivePerStudent} €/alumne ({stats.activeStudents} alumnes)
            </div>
          )}
          {!billingActive && (
            <div className="text-[11px] text-amber-500">Centre pausat (no compta al MRR)</div>
          )}
        </div>
      </div>

      {message && <SaMessage type={message.type}>{message.text}</SaMessage>}

      <SaPanel>
        <SaTabs tabs={TABS} active={tab} onChange={setTab} />

        <div className="p-4">
          {tab === 'resum' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <StatBox label="Aules" value={stats.classroomsCount} />
                <StatBox label="Personal" value={stats.staffCount} />
                <StatBox label="Alumnes actius" value={stats.activeStudents} />
              </div>

              <div className="p-4 bg-stone-950 rounded border border-stone-800">
                <h4 className="text-xs font-bold text-violet-400 uppercase mb-3">Onboarding del centre</h4>
                <OnboardingPanel
                  steps={onboarding.steps}
                  progress={onboarding.progress}
                  ready={onboarding.ready}
                />
              </div>

              <div className="p-3 bg-stone-950 rounded border border-stone-800 text-xs text-stone-400 space-y-1">
                <p>
                  <strong className="text-stone-300">Alta:</strong>{' '}
                  {new Date(school.created_at).toLocaleDateString('ca-ES')}
                </p>
                <p>
                  <strong className="text-stone-300">Slug:</strong> {school.slug}
                </p>
                <p>
                  <strong className="text-stone-300">Estat:</strong>{' '}
                  {settings.ops?.active !== false ? 'Activa' : 'Pausada / inactiva'}
                </p>
                <p className="pt-2 text-stone-500">
                  Les dades bàsiques (nom, adreça, CIF, contacte) les veu la directora a{' '}
                  <strong className="text-stone-400">Configuració → Centre</strong>. Aquí també pots
                  definir preu/alumne i estat operatiu (només superadmin).
                </p>
                <p>
                  Accés del centre:{' '}
                  <a
                    href="https://app.petitdiari.com/login"
                    className="text-violet-400 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    app.petitdiari.com/login
                  </a>
                </p>
              </div>
            </div>
          )}

          {tab === 'comercial' && (
            <SchoolCommercialTab
              schoolId={school.id}
              commercial={commercial}
              documents={documents}
              invoices={invoices}
              billingEvents={billingEvents}
              monthlyPrice={monthlyPrice}
              erpTablesMissing={erpTablesMissing}
              onMessage={setMessage}
            />
          )}

          {tab === 'dades' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase mb-3">
                  Dades del centre (compartides amb direcció)
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    run(() => updateSchoolIdentity(school.id, fd), 'Dades del centre desades')
                  }}
                  className="grid sm:grid-cols-2 gap-3"
                >
                  <SaField label="Nom *">
                    <SaInput name="name" defaultValue={school.name} required />
                  </SaField>
                  <SaField label="Slug">
                    <SaInput name="slug" defaultValue={school.slug} />
                  </SaField>
                  <SaField label="Email">
                    <SaInput name="email" type="email" defaultValue={school.email || ''} />
                  </SaField>
                  <SaField label="Telèfon">
                    <SaInput name="phone" defaultValue={school.phone || ''} />
                  </SaField>
                  <SaField label="Email contacte">
                    <SaInput name="contact_email" type="email" defaultValue={school.contact_email || ''} />
                  </SaField>
                  <SaField label="CIF">
                    <SaInput name="cif" defaultValue={school.cif || ''} />
                  </SaField>
                  <div className="sm:col-span-2">
                    <SaField label="Adreça">
                      <SaInput name="address" defaultValue={school.address || ''} />
                    </SaField>
                  </div>
                  <p className="sm:col-span-2 text-[11px] text-stone-600">
                    Horaris, logo i opcions d&apos;agenda els configura la directora a Configuració → Centre.
                  </p>
                  <SaButton type="submit" disabled={pending}>
                    Desar dades del centre
                  </SaButton>
                </form>
              </div>

              <div className="border-t border-stone-800 pt-6">
                <h4 className="text-xs font-bold text-violet-400 uppercase mb-3">
                  Facturació i estat (només superadmin)
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    run(() => updateSchoolBilling(school.id, fd), 'Facturació desada')
                  }}
                  className="grid sm:grid-cols-2 gap-3"
                >
                  <SaField label="Quota mensual al centre (€)">
                    <SaInput
                      name="monthly_price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={String(monthlyPrice)}
                    />
                  </SaField>
                  <SaField label="Estat facturació">
                    <label className="flex items-center gap-2 text-sm text-stone-300 mt-2">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={settings.ops?.active !== false}
                        className="rounded"
                      />
                      Centre actiu (compta al MRR)
                    </label>
                  </SaField>
                  {stats.activeStudents > 0 && (
                    <p className="sm:col-span-2 text-[11px] text-stone-600">
                      Referència: amb {stats.activeStudents} alumnes actius, equival a ~
                      {getEffectivePricePerStudent(monthlyPrice, stats.activeStudents)} €/alumne (només informatiu).
                    </p>
                  )}
                  <div className="sm:col-span-2">
                    <SaField label="Notes internes facturació">
                      <SaTextarea name="billing_notes" defaultValue={settings.billing?.notes || ''} />
                    </SaField>
                  </div>
                  <SaButton type="submit" disabled={pending}>
                    Desar facturació
                  </SaButton>
                </form>
              </div>

              <div className="border-t border-stone-800 pt-4">
                <SaButton
                  type="button"
                  variant="danger"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm('Eliminar escola? Només si està buida.')) return
                    run(async () => {
                      const r = await deleteSchool(school.id)
                      if (r.success) window.location.href = '/superadmin/escoles'
                      return r
                    }, '')
                  }}
                >
                  Eliminar escola
                </SaButton>
              </div>
            </div>
          )}

          {tab === 'aules' && (
            <ClassroomsTab
              schoolId={school.id}
              classrooms={classrooms}
              teachers={staff.filter((s) => ['teacher', 'auxiliary'].includes(s.role) && s.status === 'active')}
              pending={pending}
              onAction={run}
            />
          )}

          {tab === 'personal' && (
            <StaffTab schoolId={school.id} staff={staff} pending={pending} onAction={run} />
          )}

          {tab === 'alumnes' && (
            <StudentsTab
              schoolId={school.id}
              students={students}
              classrooms={classrooms.filter((c) => c.status === 'active')}
              pending={pending}
              onAction={run}
            />
          )}
        </div>
      </SaPanel>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-stone-950 border border-stone-800 rounded p-3">
      <div className="text-[11px] uppercase text-stone-500 font-bold">{label}</div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  )
}

function ClassroomsTab({
  schoolId,
  classrooms,
  teachers,
  pending,
  onAction,
}: {
  schoolId: string
  classrooms: Classroom[]
  teachers: Staff[]
  pending: boolean
  onAction: (fn: () => Promise<{ error?: string; success?: boolean }>, msg: string) => void
}) {
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <SaPanel>
        <SaPanelHeader title="Nova aula" />
        <form
          className="p-4 grid sm:grid-cols-4 gap-2 items-end"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            onAction(() => createClassroom(schoolId, fd), 'Aula creada')
            e.currentTarget.reset()
          }}
        >
          <SaField label="Nom">
            <SaInput name="name" required placeholder="Aula I0" />
          </SaField>
          <SaField label="Nivell">
            <SaSelect name="level" defaultValue="I0">
              <option value="I0">I0</option>
              <option value="I1">I1</option>
              <option value="I2">I2</option>
            </SaSelect>
          </SaField>
          <SaField label="Places">
            <SaInput name="capacity" type="number" defaultValue="15" />
          </SaField>
          <SaField label="Tutor/a">
            <SaSelect name="teacher_id" defaultValue="">
              <option value="">— Sense assignar —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </SaSelect>
          </SaField>
          <div className="sm:col-span-4">
            <SaButton type="submit" disabled={pending}>
              Afegir aula
            </SaButton>
          </div>
        </form>
      </SaPanel>

      <SaTable>
        <thead>
          <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
            <th className="py-2 px-2">Nom</th>
            <th className="py-2 px-2">Nivell</th>
            <th className="py-2 px-2">Places</th>
            <th className="py-2 px-2">Estat</th>
            <th className="py-2 px-2 text-right">Accions</th>
          </tr>
        </thead>
        <tbody>
          {classrooms.map((c) =>
            editing === c.id ? (
              <tr key={c.id} className="border-b border-stone-800/50">
                <td colSpan={5} className="p-3">
                  <form
                    className="grid sm:grid-cols-5 gap-2 items-end"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      fd.set('id', c.id)
                      onAction(() => updateClassroom(schoolId, fd), 'Aula actualitzada')
                      setEditing(null)
                    }}
                  >
                    <SaInput name="name" defaultValue={c.name} required />
                    <SaSelect name="level" defaultValue={c.level}>
                      <option value="I0">I0</option>
                      <option value="I1">I1</option>
                      <option value="I2">I2</option>
                    </SaSelect>
                    <SaInput name="capacity" type="number" defaultValue={String(c.capacity || 15)} />
                    <SaSelect name="teacher_id" defaultValue={c.teacher_id || ''}>
                      <option value="">—</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name}
                        </option>
                      ))}
                    </SaSelect>
                    <SaSelect name="status" defaultValue={c.status}>
                      <option value="active">Activa</option>
                      <option value="inactive">Inactiva</option>
                    </SaSelect>
                    <div className="sm:col-span-5 flex gap-2">
                      <SaButton type="submit" disabled={pending}>
                        Desar
                      </SaButton>
                      <SaButton type="button" variant="ghost" onClick={() => setEditing(null)}>
                        Cancel·lar
                      </SaButton>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={c.id} className="border-b border-stone-800/50 hover:bg-stone-800/20">
                <td className="py-2 px-2 font-medium text-stone-200">{c.name}</td>
                <td className="py-2 px-2 text-stone-400">{c.level}</td>
                <td className="py-2 px-2 text-stone-400">{c.capacity ?? '—'}</td>
                <td className="py-2 px-2 text-stone-400">{c.status}</td>
                <td className="py-2 px-2 text-right space-x-1">
                  <SaButton type="button" variant="secondary" onClick={() => setEditing(c.id)}>
                    Editar
                  </SaButton>
                  <SaButton
                    type="button"
                    variant="danger"
                    onClick={() => {
                      if (!confirm(`Eliminar aula "${c.name}"?`)) return
                      onAction(() => deleteClassroom(schoolId, c.id), 'Aula eliminada')
                    }}
                  >
                    Eliminar
                  </SaButton>
                </td>
              </tr>
            )
          )}
        </tbody>
      </SaTable>
    </div>
  )
}

function StaffTab({
  schoolId,
  staff,
  pending,
  onAction,
}: {
  schoolId: string
  staff: Staff[]
  pending: boolean
  onAction: (fn: () => Promise<{ error?: string; success?: boolean; tempPassword?: string }>, msg: string) => void
}) {
  return (
    <div className="space-y-4">
      <SaPanel>
        <SaPanelHeader title="Nou membre del personal" />
        <form
          className="p-4 grid sm:grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            onAction(() => createStaffMember(schoolId, fd), 'Usuari creat.')
            e.currentTarget.reset()
          }}
        >
          <SaField label="Nom complet *">
            <SaInput name="full_name" required />
          </SaField>
          <SaField label="Correu *">
            <SaInput name="email" type="email" required />
          </SaField>
          <SaField label="Rol">
            <SaSelect name="role" defaultValue="teacher">
              <option value="admin">Direcció (admin)</option>
              <option value="teacher">Educador/a</option>
              <option value="auxiliary">Auxiliar</option>
            </SaSelect>
          </SaField>
          <SaField label="Telèfon">
            <SaInput name="phone" />
          </SaField>
          <div className="sm:col-span-2 text-[11px] text-stone-500 space-y-2">
            <p>
              Contrasenya inicial si no envies correu:{' '}
              <code className="text-stone-300">{DEFAULT_STAFF_PASSWORD}</code> (canvi obligatori al primer accés)
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="send_access" className="rounded border-stone-600" />
              <span>Enviar correu d&apos;accés en crear (recomanat per la directora)</span>
            </label>
          </div>
          <SaButton type="submit" disabled={pending}>
            Crear usuari
          </SaButton>
        </form>
      </SaPanel>

      <SaTable>
        <thead>
          <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
            <th className="py-2 px-2">Nom</th>
            <th className="py-2 px-2">Email</th>
            <th className="py-2 px-2">Rol</th>
            <th className="py-2 px-2">Estat</th>
            <th className="py-2 px-2">Accés</th>
            <th className="py-2 px-2 text-right">Accions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((m) => (
            <StaffRow key={m.id} member={m} schoolId={schoolId} pending={pending} onAction={onAction} />
          ))}
        </tbody>
      </SaTable>
    </div>
  )
}

function StaffRow({
  member,
  schoolId,
  pending,
  onAction,
}: {
  member: Staff
  schoolId: string
  pending: boolean
  onAction: (fn: () => Promise<{ error?: string; success?: boolean }>, msg: string) => void
}) {
  const [edit, setEdit] = useState(false)

  if (edit) {
    return (
      <tr className="border-b border-stone-800/50">
        <td colSpan={6} className="p-3">
          <form
            className="grid sm:grid-cols-4 gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              fd.set('id', member.id)
              onAction(() => updateStaffMember(schoolId, fd), 'Personal actualitzat')
              setEdit(false)
            }}
          >
            <SaInput name="full_name" defaultValue={member.full_name} required />
            <SaInput value={member.email} disabled className="opacity-50" />
            <SaSelect name="role" defaultValue={member.role}>
              <option value="admin">admin</option>
              <option value="teacher">teacher</option>
              <option value="auxiliary">auxiliary</option>
            </SaSelect>
            <SaSelect name="status" defaultValue={member.status}>
              <option value="active">active</option>
              <option value="paused">paused</option>
              <option value="inactive">inactive</option>
            </SaSelect>
            <SaInput name="phone" defaultValue={member.phone || ''} placeholder="Telèfon" className="sm:col-span-2" />
            <div className="sm:col-span-4 flex gap-2">
              <SaButton type="submit" disabled={pending}>
                Desar
              </SaButton>
              <SaButton type="button" variant="ghost" onClick={() => setEdit(false)}>
                Cancel·lar
              </SaButton>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-stone-800/50 hover:bg-stone-800/20">
      <td className="py-2 px-2 text-stone-200">{member.full_name}</td>
      <td className="py-2 px-2 text-stone-400 text-xs">{member.email}</td>
      <td className="py-2 px-2 text-stone-400">{member.role}</td>
      <td className="py-2 px-2 text-stone-400">{member.status}</td>
      <td className="py-2 px-2">
        <SaSendAccessButton
          userId={member.id}
          schoolId={schoolId}
          email={member.email}
          alreadySent={!!member.welcome_email_sent}
        />
      </td>
      <td className="py-2 px-2 text-right space-x-1">
        {member.status === 'active' && <SaImpersonateButton userId={member.id} />}
        <SaButton type="button" variant="secondary" onClick={() => setEdit(true)}>
          Editar
        </SaButton>
        {member.status !== 'inactive' && (
          <SaButton
            type="button"
            variant="danger"
            onClick={() => {
              if (!confirm(`Desactivar ${member.full_name}?`)) return
              onAction(() => archiveStaffMember(schoolId, member.id), 'Personal desactivat')
            }}
          >
            Baixa
          </SaButton>
        )}
      </td>
    </tr>
  )
}

function StudentsTab({
  schoolId,
  students,
  classrooms,
  pending,
  onAction,
}: {
  schoolId: string
  students: Student[]
  classrooms: Classroom[]
  pending: boolean
  onAction: (fn: () => Promise<{ error?: string; success?: boolean }>, msg: string) => void
}) {
  const active = students.filter((s) => s.status === 'active')
  const archived = students.filter((s) => s.status !== 'active')

  return (
    <div className="space-y-4">
      <SaPanel>
        <SaPanelHeader title="Nou alumne" />
        <form
          className="p-4 grid sm:grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            onAction(() => createStudent(schoolId, fd), 'Alumne creat')
            e.currentTarget.reset()
          }}
        >
          <SaField label="Nom *">
            <SaInput name="first_name" required />
          </SaField>
          <SaField label="Cognoms *">
            <SaInput name="last_name" required />
          </SaField>
          <SaField label="Data naixement *">
            <SaInput name="date_of_birth" type="date" required />
          </SaField>
          <SaField label="Aula">
            <SaSelect name="classroom_id" defaultValue="">
              <option value="">— Sense aula —</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                </option>
              ))}
            </SaSelect>
          </SaField>
          <SaField label="Gènere">
            <SaSelect name="gender" defaultValue="">
              <option value="">—</option>
              <option value="M">Nen (M)</option>
              <option value="F">Nena (F)</option>
            </SaSelect>
          </SaField>
          <div className="sm:col-span-2 border-t border-stone-800 pt-3 mt-1">
            <p className="text-[11px] font-bold text-stone-500 uppercase mb-2">Tutor/a 1</p>
            <GuardianFields prefix="guardian_1" />
          </div>
          <div className="sm:col-span-2 border-t border-stone-800 pt-3">
            <p className="text-[11px] font-bold text-stone-500 uppercase mb-2">Tutor/a 2 (opcional)</p>
            <GuardianFields prefix="guardian_2" />
          </div>
          <SaButton type="submit" disabled={pending} className="sm:col-span-2">
            Afegir alumne
          </SaButton>
        </form>
      </SaPanel>

      <StudentTable
        title={`Alumnes actius (${active.length})`}
        rows={active}
        classrooms={classrooms}
        schoolId={schoolId}
        pending={pending}
        onAction={onAction}
        editable
      />

      {archived.length > 0 && (
        <StudentTable
          title={`Arxivats (${archived.length})`}
          rows={archived}
          classrooms={classrooms}
          schoolId={schoolId}
          pending={pending}
          onAction={onAction}
          editable={false}
        />
      )}
    </div>
  )
}

function StudentTable({
  title,
  rows,
  classrooms,
  schoolId,
  pending,
  onAction,
  editable,
}: {
  title: string
  rows: Student[]
  classrooms: Classroom[]
  schoolId: string
  pending: boolean
  onAction: (fn: () => Promise<{ error?: string; success?: boolean }>, msg: string) => void
  editable: boolean
}) {
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <div>
      <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">{title}</h4>
      <SaTable>
        <thead>
          <tr className="text-[11px] uppercase text-stone-500 border-b border-stone-800">
            <th className="py-2 px-2">Nom</th>
            <th className="py-2 px-2">Naixement</th>
            <th className="py-2 px-2">Aula</th>
            <th className="py-2 px-2">Família / tutors</th>
            {editable && <th className="py-2 px-2 text-right">Accions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const classroom = classrooms.find((c) => c.id === s.classroom_id)
            if (editing === s.id) {
              const g1 = s.guardians?.[0]
              const g2 = s.guardians?.[1]
              return (
                <tr key={s.id}>
                  <td colSpan={5} className="p-3">
                    <form
                      className="grid sm:grid-cols-2 gap-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                        const fd = new FormData(e.currentTarget)
                        fd.set('id', s.id)
                        fd.set('status', 'active')
                        onAction(() => updateStudent(schoolId, fd), 'Alumne actualitzat')
                        setEditing(null)
                      }}
                    >
                      <SaInput name="first_name" defaultValue={s.first_name} required />
                      <SaInput name="last_name" defaultValue={s.last_name} required />
                      <SaInput name="date_of_birth" type="date" defaultValue={s.date_of_birth} required />
                      <SaSelect name="classroom_id" defaultValue={s.classroom_id || ''}>
                        <option value="">—</option>
                        {classrooms.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </SaSelect>
                      <div className="sm:col-span-2 border-t border-stone-800 pt-2 mt-1">
                        <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Tutor/a 1</p>
                        <GuardianFields prefix="guardian_1" guardian={g1} />
                      </div>
                      <div className="sm:col-span-2 border-t border-stone-800 pt-2">
                        <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Tutor/a 2</p>
                        <GuardianFields prefix="guardian_2" guardian={g2} />
                      </div>
                      <div className="sm:col-span-2 flex gap-2">
                        <SaButton type="submit" disabled={pending}>
                          Desar
                        </SaButton>
                        <SaButton type="button" variant="ghost" onClick={() => setEditing(null)}>
                          Cancel·lar
                        </SaButton>
                      </div>
                    </form>
                  </td>
                </tr>
              )
            }
            return (
              <tr key={s.id} className="border-b border-stone-800/50 hover:bg-stone-800/20">
                <td className="py-2 px-2 text-stone-200">
                  {s.first_name} {s.last_name}
                </td>
                <td className="py-2 px-2 text-stone-400 text-xs">{s.date_of_birth}</td>
                <td className="py-2 px-2 text-stone-400 text-xs">{classroom?.name || '—'}</td>
                <td className="py-2 px-2 text-stone-400 text-xs max-w-[220px]">
                  {(s.guardians || []).length === 0 ? (
                    <span className="text-stone-600">Sense tutors</span>
                  ) : (
                    <ul className="space-y-0.5">
                      {(s.guardians || []).map((g, i) => (
                        <li key={i}>
                          <span className="text-stone-300">{g.full_name || '—'}</span>
                          {g.email && (
                            <span className="text-stone-500"> · {g.email}</span>
                          )}
                          {g.phone && (
                            <span className="text-stone-600"> · {g.phone}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                {editable && (
                  <td className="py-2 px-2 text-right space-x-1">
                    <SaButton type="button" variant="secondary" onClick={() => setEditing(s.id)}>
                      Editar
                    </SaButton>
                    <SaButton
                      type="button"
                      variant="danger"
                      onClick={() => {
                        if (!confirm(`Arxivar ${s.first_name} ${s.last_name}?`)) return
                        onAction(() => archiveStudent(schoolId, s.id), 'Alumne arxivat')
                      }}
                    >
                      Arxivar
                    </SaButton>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </SaTable>
    </div>
  )
}

function GuardianFields({
  prefix,
  guardian,
}: {
  prefix: string
  guardian?: StudentGuardian
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {guardian?.id && <input type="hidden" name={`${prefix}_id`} value={guardian.id} />}
      <SaInput name={`${prefix}_name`} placeholder="Nom complet" defaultValue={guardian?.full_name || ''} />
      <SaInput
        name={`${prefix}_email`}
        type="email"
        placeholder="Email"
        defaultValue={guardian?.email || ''}
      />
      <SaInput name={`${prefix}_phone`} placeholder="Telèfon" defaultValue={guardian?.phone || ''} />
      <SaSelect name={`${prefix}_relation`} defaultValue={guardian?.relation || 'other'}>
        <option value="mother">Mare</option>
        <option value="father">Pare</option>
        <option value="tutor">Tutor/a</option>
        <option value="other">Altre</option>
      </SaSelect>
    </div>
  )
}
