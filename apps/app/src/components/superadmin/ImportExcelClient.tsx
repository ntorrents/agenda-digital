'use client'

import { useState, useTransition } from 'react'
import {
  executeSchoolImport,
  getImportTemplateBase64,
  validateSchoolImport,
} from '@/app/superadmin/import-actions'
import { SaButton, SaField, SaMessage, SaPanel, SaPanelHeader, SaSelect } from './sa-ui'

type SchoolOption = { id: string; name: string }

type ImportError = { sheet: string; row: number; field?: string; message: string }

export function ImportExcelClient({ schools }: { schools: SchoolOption[] }) {
  const [schoolId, setSchoolId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<ImportError[]>([])
  const [preview, setPreview] = useState<{ classrooms: number; staff: number; students: number } | null>(
    null
  )
  const [parsedJson, setParsedJson] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const downloadTemplate = () => {
    startTransition(async () => {
      const result = await getImportTemplateBase64()
      if (!result.data) return
      const bytes = Uint8Array.from(atob(result.data), (c) => c.charCodeAt(0))
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const validate = () => {
    if (!schoolId) {
      setMessage({ type: 'err', text: 'Selecciona una escola' })
      return
    }
    if (!file) {
      setMessage({ type: 'err', text: 'Selecciona un arxiu .xlsx' })
      return
    }

    setMessage(null)
    setErrors([])
    setPreview(null)
    setParsedJson(null)

    startTransition(async () => {
      const fd = new FormData()
      fd.set('file', file)
      const result = await validateSchoolImport(schoolId, fd)

      if (result.error) {
        setMessage({ type: 'err', text: result.error })
        return
      }

      if (result.errors?.length) {
        setErrors(result.errors)
        setMessage({ type: 'err', text: `${result.errors.length} error(s) trobat(s). Corregeix l'Excel i torna a validar.` })
        return
      }

      setPreview(result.preview || null)
      setParsedJson(result.parsedJson || null)
      setMessage({ type: 'ok', text: 'Arxiu vàlid. Revisa el resum i confirma la importació.' })
    })
  }

  const execute = () => {
    if (!schoolId || !parsedJson) return
    if (!confirm('Importar dades a la base de dades? Aquesta acció no es pot desfer fàcilment.')) return

    startTransition(async () => {
      const result = await executeSchoolImport(schoolId, parsedJson)
      if (result.error) {
        setMessage({ type: 'err', text: result.error })
        return
      }
      const s = result.summary!
      setMessage({
        type: 'ok',
        text: `Importació completada: ${s.classrooms} aules, ${s.staff} personal, ${s.students} alumnes.`,
      })
      setFile(null)
      setPreview(null)
      setParsedJson(null)
      setErrors([])
    })
  }

  return (
    <div className="space-y-4">
      {message && <SaMessage type={message.type}>{message.text}</SaMessage>}

      <SaPanel>
        <SaPanelHeader title="1. Escola destí" />
        <div className="p-4">
          <SaField label="Centre">
            <SaSelect value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
              <option value="">— Selecciona —</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </SaSelect>
          </SaField>
        </div>
      </SaPanel>

      <SaPanel>
        <SaPanelHeader title="2. Plantilla i format" />
        <div className="p-4 text-sm text-stone-400 space-y-3">
          <p>L&apos;arxiu ha de tenir <strong className="text-stone-300">3 fulles</strong>:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>
              <strong className="text-stone-300">Aules</strong>: Nom_Aula, Nivell, Capacitat
            </li>
            <li>
              <strong className="text-stone-300">Educadors</strong>: Nom_Complet, Email, Password (opcional),
              Aula_Assignada, Rol
            </li>
            <li>
              <strong className="text-stone-300">Alumnes</strong>: Nom, Cognoms, Data_Naixement (YYYY-MM-DD),
              Genere (M/F), Aula_Assignada, Email_Familiar, Nom_Familiar, Relacio
            </li>
          </ul>
          <SaButton type="button" variant="secondary" disabled={pending} onClick={downloadTemplate}>
            Descarregar plantilla .xlsx
          </SaButton>
        </div>
      </SaPanel>

      <SaPanel>
        <SaPanelHeader title="3. Pujar i validar" />
        <div className="p-4 space-y-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            className="block text-sm text-stone-400 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-stone-800 file:text-stone-200"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null)
              setPreview(null)
              setParsedJson(null)
              setErrors([])
            }}
          />
          <SaButton type="button" disabled={pending || !schoolId || !file} onClick={validate}>
            Validar arxiu
          </SaButton>
        </div>
      </SaPanel>

      {errors.length > 0 && (
        <SaPanel>
          <SaPanelHeader title={`Errors (${errors.length})`} />
          <div className="p-4 max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-stone-500 border-b border-stone-800">
                  <th className="py-1 px-2 text-left">Fulla</th>
                  <th className="py-1 px-2 text-left">Fila</th>
                  <th className="py-1 px-2 text-left">Camp</th>
                  <th className="py-1 px-2 text-left">Problema</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, i) => (
                  <tr key={i} className="border-b border-stone-800/50 text-stone-400">
                    <td className="py-1 px-2">{err.sheet}</td>
                    <td className="py-1 px-2">{err.row || '—'}</td>
                    <td className="py-1 px-2">{err.field || '—'}</td>
                    <td className="py-1 px-2 text-red-300">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SaPanel>
      )}

      {preview && parsedJson && (
        <SaPanel>
          <SaPanelHeader title="4. Confirmar importació" />
          <div className="p-4 space-y-3 text-sm">
            <ul className="text-stone-300 space-y-1">
              <li>Aules: <strong>{preview.classrooms}</strong></li>
              <li>Educadors: <strong>{preview.staff}</strong></li>
              <li>Alumnes: <strong>{preview.students}</strong></li>
            </ul>
            <p className="text-xs text-stone-500">
              Es crearan registres nous. Emails ja existents al sistema es reutilitzaran sense duplicar comptes.
            </p>
            <SaButton type="button" disabled={pending} onClick={execute}>
              Executar importació
            </SaButton>
          </div>
        </SaPanel>
      )}
    </div>
  )
}
