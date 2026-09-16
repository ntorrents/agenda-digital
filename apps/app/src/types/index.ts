// ============================================
// Petit Diari — Tipos de dominio
// ============================================

import type {
  UserRole,
  ClassroomLevel,
  Mood,
  MealAmount,
  DiaperType,
  GuardianRelation,
  EventType,
  EventAudience,
} from './enums'

export type { UserRole, ClassroomLevel, Mood, MealAmount, DiaperType, GuardianRelation, EventType, EventAudience }

// ---- Entidades principales ----

export interface School {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  created_at: string
}

export interface Profile {
  id: string // mismo que auth.users.id
  school_id: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  email: string
  phone: string | null
  status: 'active' | 'inactive' | 'paused'
  created_at: string
}

export interface Classroom {
  id: string
  school_id: string
  name: string
  level: ClassroomLevel
  teacher_id: string | null
  capacity: number | null
  status: 'active' | 'inactive' | 'paused'
  created_at: string
}

export interface Student {
  id: string
  school_id: string
  classroom_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  avatar_url: string | null
  allergies: string | null
  notes: string | null
  status: 'active' | 'inactive' | 'paused'
  created_at: string
}

export interface StudentGuardian {
  id: string
  student_id: string
  guardian_id: string
  relation: GuardianRelation
  is_primary: boolean
  created_at: string
}

export interface DailyLog {
  id: string
  student_id: string
  school_id: string
  classroom_id: string
  date: string // YYYY-MM-DD
  teacher_id: string

  // Estado de ánimo
  mood: Mood | null

  // Alimentación
  meal_breakfast: MealAmount | null
  meal_first_course: MealAmount | null
  meal_second_course: MealAmount | null
  meal_dessert: MealAmount | null
  meal_snack: MealAmount | null
  /** @deprecated usar meal_first_course */
  meal_lunch?: MealAmount | null

  // Pañal
  diaper_type: DiaperType | null
  diaper_changes: number

  // Siesta
  nap_start: string | null // HH:MM
  nap_end: string | null

  // Extras
  photos: string[] // URLs de Supabase Storage
  notes: string | null

  /** draft = borrador interno; published = visible para familias */
  status: 'draft' | 'published'
  published_at: string | null

  created_at: string
  updated_at: string
}

export interface EventAnnouncement {
  id: string
  school_id: string
  classroom_id: string | null // null = para todo el centro
  author_id: string
  title: string
  description: string | null
  event_type: EventType
  audience: EventAudience
  event_date: string | null
  is_pinned: boolean
  created_at: string
}

// ---- Tipos compuestos (para queries con joins) ----

export interface StudentWithGuardians extends Student {
  guardians: (StudentGuardian & { guardian: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'> })[]
}

export interface ClassroomWithTeacher extends Classroom {
  teacher: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
  student_count: number
}

export interface DailyLogWithStudent extends DailyLog {
  student: Pick<Student, 'id' | 'first_name' | 'last_name' | 'avatar_url'>
}
