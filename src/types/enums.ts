// ============================================
// Pas A Pas — Enums de dominio
// ============================================

/** Roles de usuario en el sistema */
export type UserRole = 'admin' | 'teacher' | 'guardian'

/** Niveles de aula (ciclo infantil 0-3 años) */
export type ClassroomLevel = 'I0' | 'I1' | 'I2'

/** Estado de ánimo del alumno */
export type Mood = 'happy' | 'calm' | 'sad' | 'irritable'

/** Nivel de alimentación por toma */
export type MealAmount = 'all' | 'most' | 'little' | 'none'

/** Tipo de toma/comida */
export type MealType = 'breakfast' | 'lunch' | 'snack'

/** Tipo de pañal */
export type DiaperType = 'pee' | 'poo' | 'both' | 'dry'

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
export const MEAL_TYPE_OPTIONS: MealType[] = ['breakfast', 'lunch', 'snack']
export const DIAPER_TYPE_OPTIONS: DiaperType[] = ['pee', 'poo', 'both', 'dry']
