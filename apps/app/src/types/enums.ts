// ============================================
// Petit Diari — Enums de dominio
// ============================================

/** Roles de usuario en el sistema */
export type UserRole = 'admin' | 'teacher' | 'auxiliary' | 'guardian'

/** Niveles de aula (ciclo infantil 0-3 años) */
export type ClassroomLevel = 'I0' | 'I1' | 'I2'

/** Estado de ánimo del alumno */
export type Mood = 'happy' | 'calm' | 'sad' | 'irritable'

/** Nivel de alimentación por toma */
export type MealAmount = 'all' | 'most' | 'little' | 'none'

/** Tipo de toma/comida */
export type MealType =
  | 'breakfast'
  | 'first_course'
  | 'second_course'
  | 'dessert'
  | 'lunch'
  | 'snack'

/** Estado de la agenda del día */
export type DailyLogStatus = 'draft' | 'published'

/** Tipus de deposició (pot ser múltiple, guardat com CSV) */
export type DiaperType = 'soft' | 'normal' | 'liquid'

/** Tipo de relación tutor-alumno */
export type GuardianRelation = 'mother' | 'father' | 'tutor' | 'other'

/** Tipo de evento/anuncio */
export type EventType = 'event' | 'announcement' | 'alert'

/** Visibilidad de evento */
export type EventAudience = 'school' | 'classroom' | 'individual'

// ============================================
// Mapeos para i18n — claves de traducción
// ============================================

export const MOOD_OPTIONS: Mood[] = ['happy', 'calm', 'sad', 'irritable']
export const MEAL_AMOUNT_OPTIONS: MealAmount[] = ['all', 'most', 'little', 'none']
export const MEAL_TYPE_OPTIONS: MealType[] = [
  'breakfast',
  'first_course',
  'second_course',
  'dessert',
]
export const DAILY_LOG_STATUS_OPTIONS: DailyLogStatus[] = ['draft', 'published']
export const DIAPER_TYPE_OPTIONS: DiaperType[] = ['soft', 'normal', 'liquid']
