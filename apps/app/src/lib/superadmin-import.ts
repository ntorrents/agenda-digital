import * as XLSX from 'xlsx'
import { normalizeEmail } from '@/lib/auth-email'
import { normalizeGender, normalizeRelation } from '@/lib/guardian-link'

export type ImportRowError = {
  sheet: string
  row: number
  field?: string
  message: string
}

export type ParsedClassroom = { name: string; level: string; capacity: number }
export type ParsedStaff = {
  fullName: string
  email: string
  password?: string
  classroomName?: string
  role: 'teacher' | 'admin' | 'auxiliary'
}
export type ParsedStudent = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string | null
  classroomName?: string
  guardianName?: string
  guardianEmail?: string
  guardianRelation: string
}

export type ParsedImport = {
  classrooms: ParsedClassroom[]
  staff: ParsedStaff[]
  students: ParsedStudent[]
}

const SHEET_AULES = ['aules', 'aulas', 'classrooms']
const SHEET_STAFF = ['educadors', 'educadores', 'personal', 'staff']
const SHEET_STUDENTS = ['alumnes', 'alumnos', 'students']

function normKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
}

function pick(row: Record<string, unknown>, ...keys: string[]): string {
  const map = new Map<string, unknown>()
  for (const [k, v] of Object.entries(row)) {
    map.set(normKey(k), v)
  }
  for (const key of keys) {
    const val = map.get(normKey(key))
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim()
    }
  }
  return ''
}

function findSheet(wb: XLSX.WorkBook, names: string[]): XLSX.WorkSheet | null {
  for (const name of wb.SheetNames) {
    if (names.includes(name.trim().toLowerCase())) {
      return wb.Sheets[name]
    }
  }
  return null
}

function sheetToRows(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  return XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[]
}

function parseDate(raw: string): string | null {
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const d = new Date(raw)
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10)
  }
  return null
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function parseImportWorkbook(buffer: ArrayBuffer): { data?: ParsedImport; errors: ImportRowError[] } {
  const errors: ImportRowError[] = []
  const wb = XLSX.read(buffer, { type: 'array' })

  const aulesSheet = findSheet(wb, SHEET_AULES)
  const staffSheet = findSheet(wb, SHEET_STAFF)
  const studentsSheet = findSheet(wb, SHEET_STUDENTS)

  if (!aulesSheet) {
    errors.push({ sheet: '—', row: 0, message: 'Falta la fulla "Aules" (o Aulas)' })
  }
  if (!staffSheet) {
    errors.push({ sheet: '—', row: 0, message: 'Falta la fulla "Educadors" (o Educadores)' })
  }
  if (!studentsSheet) {
    errors.push({ sheet: '—', row: 0, message: 'Falta la fulla "Alumnes" (o Alumnos)' })
  }
  if (errors.length) return { errors }

  const classrooms: ParsedClassroom[] = []
  const classroomNames = new Set<string>()

  for (let i = 0; i < sheetToRows(aulesSheet!).length; i++) {
    const row = sheetToRows(aulesSheet!)[i]
    const rowNum = i + 2
    const name = pick(row, 'Nom_Aula', 'Nom Aula', 'Nombre_Aula', 'name')
    const level = pick(row, 'Nivell', 'Nivel', 'Level', 'level') || 'I0'
    const capRaw = pick(row, 'Capacitat', 'Capacidad', 'Capacity', 'capacity')
    const capacity = parseInt(capRaw || '15', 10)

    if (!name) continue

    if (classroomNames.has(name.toLowerCase())) {
      errors.push({ sheet: 'Aules', row: rowNum, field: 'Nom_Aula', message: `Nom d'aula duplicat: "${name}"` })
      continue
    }
    classroomNames.add(name.toLowerCase())

    if (Number.isNaN(capacity) || capacity < 1) {
      errors.push({ sheet: 'Aules', row: rowNum, field: 'Capacitat', message: 'Capacitat invàlida' })
      continue
    }

    classrooms.push({ name, level, capacity })
  }

  const staff: ParsedStaff[] = []
  const staffEmails = new Set<string>()

  for (let i = 0; i < sheetToRows(staffSheet!).length; i++) {
    const row = sheetToRows(staffSheet!)[i]
    const rowNum = i + 2
    const fullName = pick(row, 'Nom_Complet', 'Nom Complet', 'Nombre', 'full_name')
    const email = normalizeEmail(pick(row, 'Email', 'Correu', 'email'))
    const password = pick(row, 'Password', 'Contrasenya', 'password') || undefined
    const classroomName = pick(row, 'Aula_Assignada', 'Aula Assignada', 'Aula', 'classroom') || undefined
    const roleRaw = pick(row, 'Rol', 'Role', 'role').toLowerCase()

    if (!fullName && !email) continue

    if (!fullName) {
      errors.push({ sheet: 'Educadors', row: rowNum, field: 'Nom_Complet', message: 'Nom obligatori' })
      continue
    }
    if (!email || !isValidEmail(email)) {
      errors.push({ sheet: 'Educadors', row: rowNum, field: 'Email', message: `Email invàlid: "${email || '(buit)'}"` })
      continue
    }
    if (staffEmails.has(email)) {
      errors.push({ sheet: 'Educadors', row: rowNum, field: 'Email', message: `Email duplicat a l'Excel: ${email}` })
      continue
    }
    staffEmails.add(email)

    let role: ParsedStaff['role'] = 'teacher'
    if (['admin', 'direccio', 'direccion', 'director', 'directora'].includes(roleRaw)) role = 'admin'
    if (['auxiliary', 'auxiliar'].includes(roleRaw)) role = 'auxiliary'

    if (classroomName && !classroomNames.has(classroomName.toLowerCase())) {
      errors.push({
        sheet: 'Educadors',
        row: rowNum,
        field: 'Aula_Assignada',
        message: `Aula "${classroomName}" no existeix a la fulla Aules`,
      })
    }

    staff.push({ fullName, email, password, classroomName, role })
  }

  const students: ParsedStudent[] = []

  for (let i = 0; i < sheetToRows(studentsSheet!).length; i++) {
    const row = sheetToRows(studentsSheet!)[i]
    const rowNum = i + 2
    const firstName = pick(row, 'Nom', 'Nombre', 'first_name')
    const lastName = pick(row, 'Cognoms', 'Apellidos', 'last_name')
    const dobRaw = pick(row, 'Data_Naixement', 'Data Naixement', 'Fecha_Nacimiento', 'date_of_birth')
    const genderRaw = pick(row, 'Genere', 'Gènere', 'Genero', 'gender')
    const classroomName = pick(row, 'Aula_Assignada', 'Aula Assignada', 'Aula', 'classroom') || undefined
    const guardianEmail = normalizeEmail(pick(row, 'Email_Familiar', 'Email Familiar', 'guardian_email'))
    const guardianName = pick(row, 'Nom_Familiar', 'Nom Familiar', 'guardian_name')
    const guardianRelation = normalizeRelation(pick(row, 'Relacio', 'Relación', 'relation') || 'other')

    if (!firstName && !lastName) continue

    if (!firstName || !lastName) {
      errors.push({ sheet: 'Alumnes', row: rowNum, message: 'Nom i cognoms obligatoris' })
      continue
    }

    const dateOfBirth = parseDate(dobRaw)
    if (!dateOfBirth) {
      errors.push({
        sheet: 'Alumnes',
        row: rowNum,
        field: 'Data_Naixement',
        message: `Data invàlida (usa YYYY-MM-DD): "${dobRaw}"`,
      })
      continue
    }

    const gender = normalizeGender(genderRaw)
    if (genderRaw && !gender) {
      errors.push({
        sheet: 'Alumnes',
        row: rowNum,
        field: 'Genere',
        message: `Gènere invàlid (M/F): "${genderRaw}"`,
      })
      continue
    }

    if (classroomName && !classroomNames.has(classroomName.toLowerCase())) {
      errors.push({
        sheet: 'Alumnes',
        row: rowNum,
        field: 'Aula_Assignada',
        message: `Aula "${classroomName}" no existeix a la fulla Aules`,
      })
    }

    if (guardianEmail && !isValidEmail(guardianEmail)) {
      errors.push({
        sheet: 'Alumnes',
        row: rowNum,
        field: 'Email_Familiar',
        message: `Email familiar invàlid: "${guardianEmail}"`,
      })
    }

    if (guardianEmail && !guardianName) {
      errors.push({
        sheet: 'Alumnes',
        row: rowNum,
        field: 'Nom_Familiar',
        message: 'Si hi ha email familiar cal nom del tutor/a',
      })
    }

    students.push({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      classroomName,
      guardianName: guardianName || undefined,
      guardianEmail: guardianEmail || undefined,
      guardianRelation,
    })
  }

  if (errors.length) return { errors }

  return {
    data: { classrooms, staff, students },
    errors: [],
  }
}

export function buildImportTemplateBuffer(): Buffer {
  const wb = XLSX.utils.book_new()

  const aules = [
    { Nom_Aula: 'I0 Sol', Nivell: 'I0', Capacitat: 20 },
    { Nom_Aula: 'I1 Lluna', Nivell: 'I1', Capacitat: 18 },
  ]
  const educadors = [
    { Nom_Complet: 'Maria Garcia', Email: 'maria@exemple.cat', Password: '', Aula_Assignada: 'I0 Sol', Rol: 'teacher' },
    { Nom_Complet: 'Anna Directora', Email: 'directora@exemple.cat', Password: '', Aula_Assignada: '', Rol: 'admin' },
  ]
  const alumnes = [
    {
      Nom: 'Pau',
      Cognoms: 'Martí',
      Data_Naixement: '2022-03-15',
      Genere: 'M',
      Aula_Assignada: 'I0 Sol',
      Email_Familiar: 'pare@exemple.cat',
      Nom_Familiar: 'Joan Martí',
      Relacio: 'father',
    },
  ]

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(aules), 'Aules')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(educadors), 'Educadors')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(alumnes), 'Alumnes')

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}
