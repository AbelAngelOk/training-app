export type UserRole = 'free_user' | 'premium_user' | 'coach' | 'admin'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'grace_period'
export type ProgramType = 'official' | 'personal'
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

export interface Database {
  public: {
    Tables: {
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
          active: boolean
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
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          active?: boolean
          updated_at?: string
        }
      }
      user_programs: {
        Row: {
          id: string
          user_id: string
          workout_program_id: string
          assigned_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_program_id: string
          assigned_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          workout_program_id?: string
          assigned_at?: string
          updated_at?: string
        }
      }
      program_days: {
        Row: {
          id: string
          workout_program_id: string
          weekday: Weekday
          training_session_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_program_id: string
          weekday: Weekday
          training_session_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          weekday?: Weekday
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          estimated_duration_minutes?: number | null
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
          name: string
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      equipment: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
      exercises: {
        Row: {
          id: string
          name: string
          description: string | null
          instructions: string | null
          image_url: string | null
          video_url: string | null
          muscle_group_id: string
          equipment_id: string | null
          difficulty: ExerciseDifficulty
          created_at: string
          updated_at: string
        }
        Insert: never
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
        Insert: never
        Update: never
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
