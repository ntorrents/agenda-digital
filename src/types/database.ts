// ============================================
// Pas A Pas — Tipos de Supabase Database
// Este archivo se puede regenerar con:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts
// Por ahora se define manualmente para empezar a desarrollar.
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

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          slug: string
          address: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['schools']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['schools']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          school_id: string
          role: UserRole
          full_name: string
          avatar_url: string | null
          email: string
          phone: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'> & {
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      classrooms: {
        Row: {
          id: string
          school_id: string
          name: string
          level: ClassroomLevel
          teacher_id: string | null
          capacity: number | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['classrooms']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['classrooms']['Insert']>
      }
      students: {
        Row: {
          id: string
          school_id: string
          classroom_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          avatar_url: string | null
          allergies: string | null
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['students']['Insert']>
      }
      student_guardians: {
        Row: {
          id: string
          student_id: string
          guardian_id: string
          relation: GuardianRelation
          is_primary: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['student_guardians']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['student_guardians']['Insert']>
      }
      daily_logs: {
        Row: {
          id: string
          student_id: string
          school_id: string
          classroom_id: string
          date: string
          teacher_id: string
          mood: Mood | null
          meal_breakfast: MealAmount | null
          meal_lunch: MealAmount | null
          meal_snack: MealAmount | null
          diaper_type: DiaperType | null
          diaper_changes: number
          nap_start: string | null
          nap_end: string | null
          photos: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_logs']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['daily_logs']['Insert']>
      }
      events_announcements: {
        Row: {
          id: string
          school_id: string
          classroom_id: string | null
          author_id: string
          title: string
          description: string | null
          event_type: EventType
          audience: EventAudience
          event_date: string | null
          is_pinned: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['events_announcements']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['events_announcements']['Insert']>
      }
    }
    Enums: {
      user_role: UserRole
      classroom_level: ClassroomLevel
      mood: Mood
      meal_amount: MealAmount
      diaper_type: DiaperType
      guardian_relation: GuardianRelation
      event_type: EventType
      event_audience: EventAudience
    }
  }
}
