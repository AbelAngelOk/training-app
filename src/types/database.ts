export type UserRole = 'free_user' | 'premium_user' | 'coach' | 'admin'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'grace_period'
export type ProgramType = 'official' | 'personal' | 'challenge'
export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type SessionType = 'official' | 'personal'
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type WorkoutStatus = 'in_progress' | 'completed' | 'cancelled'
export type CalendarEventStatus = 'scheduled' | 'completed' | 'skipped'
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected'
export type RankingType = 'training_hours' | 'weight_lifted' | 'distance'
export type StoreProvider = 'google_play' | 'apple_app_store'
export type HealthProvider = 'health_connect' | 'apple_health' | 'garmin' | 'fitbit' | 'samsung_health'
export type CoachClientStatus = 'active' | 'inactive'
export type ContentStatus = 'draft' | 'published' | 'archived'

/**
 * Raw table definitions. supabase-js v2 requires every table to expose a
 * `Relationships` array to conform to its GenericSchema; it is added
 * mechanically via WithRelationships below so definitions stay readable.
 */
interface TableDefinitions {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          role?: UserRole
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          avatar_url: string | null
          city: string | null
          province: string | null
          country: string | null
          bio: string | null
          tag: string | null
          tag_updated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          avatar_url?: string | null
          city?: string | null
          province?: string | null
          country?: string | null
          bio?: string | null
          tag?: string | null
          tag_updated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string
          avatar_url?: string | null
          city?: string | null
          province?: string | null
          country?: string | null
          bio?: string | null
          tag?: string | null
          tag_updated_at?: string | null
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          code: string
          name: string
          duration_months: number
          price: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_plan_id: string
          store_provider: StoreProvider
          store_transaction_id: string
          starts_at: string
          expires_at: string
          status: SubscriptionStatus
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      workout_programs: {
        Row: {
          id: string
          name: string
          description: string | null
          type: ProgramType
          owner_id: string | null
          source_program_id: string | null
          status: ContentStatus
          duration_days: number | null
          achievement_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: ProgramType
          owner_id?: string | null
          source_program_id?: string | null
          status?: ContentStatus
          duration_days?: number | null
          achievement_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          status?: ContentStatus
          duration_days?: number | null
          achievement_id?: string | null
          updated_at?: string
        }
      }
      user_programs: {
        Row: {
          id: string
          user_id: string
          workout_program_id: string
          assigned_at: string
          is_active: boolean
          deactivated_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_program_id: string
          assigned_at?: string
          is_active?: boolean
          deactivated_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          workout_program_id?: string
          assigned_at?: string
          is_active?: boolean
          deactivated_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
      }
      program_days: {
        Row: {
          id: string
          workout_program_id: string
          weekday: Weekday | null
          day_number: number | null
          training_session_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_program_id: string
          weekday?: Weekday | null
          day_number?: number | null
          training_session_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          weekday?: Weekday | null
          day_number?: number | null
          training_session_id?: string
          updated_at?: string
        }
      }
      training_sessions: {
        Row: {
          id: string
          name: string
          description: string | null
          type: SessionType
          owner_id: string | null
          source_session_id: string | null
          estimated_duration_minutes: number | null
          targets_configured_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: SessionType
          owner_id?: string | null
          source_session_id?: string | null
          estimated_duration_minutes?: number | null
          targets_configured_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          targets_configured_at?: string | null
          updated_at?: string
        }
      }
      session_exercises: {
        Row: {
          id: string
          training_session_id: string
          exercise_id: string
          sort_order: number
          target_sets: number | null
          target_reps: number | null
          target_weight: number | null
          target_duration_seconds: number | null
          target_distance_meters: number | null
          rest_seconds: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          training_session_id: string
          exercise_id: string
          sort_order: number
          target_sets?: number | null
          target_reps?: number | null
          target_weight?: number | null
          target_duration_seconds?: number | null
          target_distance_meters?: number | null
          rest_seconds?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          sort_order?: number
          target_sets?: number | null
          target_reps?: number | null
          target_weight?: number | null
          target_duration_seconds?: number | null
          target_distance_meters?: number | null
          rest_seconds?: number | null
          updated_at?: string
        }
      }
      muscle_groups: {
        Row: {
          id: string
          name_es: string
          name_en: string
          description_es: string | null
          description_en: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_es: string
          name_en: string
          description_es?: string | null
          description_en?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name_es?: string
          name_en?: string
          description_es?: string | null
          description_en?: string | null
          updated_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          name_es: string
          name_en: string
          description_es: string | null
          description_en: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_es: string
          name_en: string
          description_es?: string | null
          description_en?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name_es?: string
          name_en?: string
          description_es?: string | null
          description_en?: string | null
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name_es: string
          name_en: string
          description_es: string | null
          description_en: string | null
          instructions_es: string | null
          instructions_en: string | null
          tips_es: string | null
          tips_en: string | null
          image_url: string | null
          external_id: string | null
          fitgifs_slug: string | null
          difficulty: ExerciseDifficulty
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_es: string
          name_en: string
          description_es?: string | null
          description_en?: string | null
          instructions_es?: string | null
          instructions_en?: string | null
          tips_es?: string | null
          tips_en?: string | null
          image_url?: string | null
          external_id?: string | null
          fitgifs_slug?: string | null
          difficulty?: ExerciseDifficulty
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name_es?: string
          name_en?: string
          description_es?: string | null
          description_en?: string | null
          instructions_es?: string | null
          instructions_en?: string | null
          tips_es?: string | null
          tips_en?: string | null
          image_url?: string | null
          external_id?: string | null
          fitgifs_slug?: string | null
          difficulty?: ExerciseDifficulty
          active?: boolean
          updated_at?: string
        }
      }
      exercise_muscle_groups: {
        Row: {
          exercise_id: string
          muscle_group_id: string
          created_at: string
        }
        Insert: {
          exercise_id: string
          muscle_group_id: string
          created_at?: string
        }
        Update: never
      }
      exercise_equipment: {
        Row: {
          exercise_id: string
          equipment_id: string
          created_at: string
        }
        Insert: {
          exercise_id: string
          equipment_id: string
          created_at?: string
        }
        Update: never
      }
      workout_executions: {
        Row: {
          id: string
          user_id: string
          training_session_id: string
          started_at: string
          completed_at: string | null
          duration_seconds: number | null
          status: WorkoutStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          training_session_id: string
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          status?: WorkoutStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number | null
          status?: WorkoutStatus
          updated_at?: string
        }
      }
      workout_exercise_executions: {
        Row: {
          id: string
          workout_execution_id: string
          session_exercise_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_execution_id: string
          session_exercise_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          updated_at?: string
        }
      }
      workout_sets: {
        Row: {
          id: string
          workout_exercise_execution_id: string
          set_number: number
          weight: number | null
          reps: number | null
          duration_seconds: number | null
          distance_meters: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_exercise_execution_id: string
          set_number: number
          weight?: number | null
          reps?: number | null
          duration_seconds?: number | null
          distance_meters?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          weight?: number | null
          reps?: number | null
          duration_seconds?: number | null
          distance_meters?: number | null
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          training_session_id: string
          scheduled_date: string
          status: CalendarEventStatus
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      user_stats: {
        Row: {
          user_id: string
          total_workouts: number
          total_training_seconds: number
          total_weight_lifted: number
          total_distance_meters: number
          current_streak: number
          best_streak: number
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      friend_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: FriendRequestStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: FriendRequestStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: FriendRequestStatus
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_a_id: string
          user_b_id: string
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      ranking_snapshots: {
        Row: {
          id: string
          user_id: string
          ranking_type: RankingType
          value: number
          city: string | null
          province: string | null
          country: string | null
          snapshot_date: string
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      achievements: {
        Row: {
          id: string
          code: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          code?: string
          name?: string
          description?: string | null
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      health_connections: {
        Row: {
          id: string
          user_id: string
          provider: HealthProvider
          external_user_id: string | null
          connected_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: HealthProvider
          external_user_id?: string | null
          connected_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          external_user_id?: string | null
          updated_at?: string
        }
      }
      coach_clients: {
        Row: {
          id: string
          coach_id: string
          client_id: string
          status: CoachClientStatus
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
}

type WithRelationships<T> = {
  [K in keyof T]: T[K] & { Relationships: [] }
}

export interface Database {
  public: {
    Tables: WithRelationships<TableDefinitions>
    Views: {
      [_ in never]: never
    }
    Functions: {
      duplicate_program_deep: {
        Args: {
          p_source_program_id: string
          p_name?: string | null
        }
        Returns: string
      }
      upsert_exercise_with_relations: {
        Args: {
          p_id: string | null
          p_exercise: Record<string, unknown>
          p_muscle_group_ids: string[]
          p_equipment_ids: string[] | null
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience row types
export type UserRow = Database['public']['Tables']['users']['Row']
export type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']
export type SubscriptionPlanRow = Database['public']['Tables']['subscription_plans']['Row']
export type UserSubscriptionRow = Database['public']['Tables']['user_subscriptions']['Row']
export type WorkoutProgramRow = Database['public']['Tables']['workout_programs']['Row']
export type UserProgramRow = Database['public']['Tables']['user_programs']['Row']
export type ProgramDayRow = Database['public']['Tables']['program_days']['Row']
export type TrainingSessionRow = Database['public']['Tables']['training_sessions']['Row']
export type SessionExerciseRow = Database['public']['Tables']['session_exercises']['Row']
export type MuscleGroupRow = Database['public']['Tables']['muscle_groups']['Row']
export type EquipmentRow = Database['public']['Tables']['equipment']['Row']
export type ExerciseRow = Database['public']['Tables']['exercises']['Row']
export type ExerciseMuscleGroupRow = Database['public']['Tables']['exercise_muscle_groups']['Row']
export type ExerciseEquipmentRow = Database['public']['Tables']['exercise_equipment']['Row']
export type WorkoutExecutionRow = Database['public']['Tables']['workout_executions']['Row']
export type WorkoutExerciseExecutionRow = Database['public']['Tables']['workout_exercise_executions']['Row']
export type WorkoutSetRow = Database['public']['Tables']['workout_sets']['Row']
export type CalendarEventRow = Database['public']['Tables']['calendar_events']['Row']
export type UserStatsRow = Database['public']['Tables']['user_stats']['Row']
export type FriendRequestRow = Database['public']['Tables']['friend_requests']['Row']
export type FriendshipRow = Database['public']['Tables']['friendships']['Row']
export type RankingSnapshotRow = Database['public']['Tables']['ranking_snapshots']['Row']
export type AchievementRow = Database['public']['Tables']['achievements']['Row']
export type UserAchievementRow = Database['public']['Tables']['user_achievements']['Row']
export type HealthConnectionRow = Database['public']['Tables']['health_connections']['Row']
