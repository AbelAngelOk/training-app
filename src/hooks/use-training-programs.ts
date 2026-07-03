import { useQuery } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'
import type { Program, Session, DayCode } from '@/types/training'

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

const QUERY_KEYS = {
  programs: ['programs'],
  programDetail: (id: string) => ['programs', id],
  sessions: (programId: string) => ['programs', programId, 'sessions'],
}

interface WorkoutProgram {
  id: string
  name: string
  description: string
  type: 'official' | 'personal'
  active: boolean
}

interface TrainingSession {
  id: string
  name: string
  description: string
  type: 'official' | 'personal'
  estimated_duration_minutes: number
}

interface ProgramDay {
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  training_session_id: string
}

interface SessionExercise {
  id: string
  exercise_id: string
  sort_order: number
  target_sets: number
  target_reps: number | null
  target_duration_seconds: number | null
  rest_seconds: number
}

interface Exercise {
  id: string
  name: string
  description: string
  muscle_group_id: string
  equipment_id: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const weekdayToCode: Record<string, DayCode> = {
  monday: 'L',
  tuesday: 'M',
  wednesday: 'X',
  thursday: 'J',
  friday: 'V',
  saturday: 'S',
  sunday: 'D',
}

export function useTrainingPrograms() {
  return useQuery({
    queryKey: QUERY_KEYS.programs,
    queryFn: async () => {
      // Fetch all programs
      const { data: programs, error: progError } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('active', true)

      if (progError) throw progError
      if (!programs || programs.length === 0) return []

      // For each program, fetch its sessions and structure data
      const enrichedPrograms = await Promise.all(
        programs.map(async (program: WorkoutProgram) => {
          const { data: programDays, error: daysError } = await supabase
            .from('program_days')
            .select('*')
            .eq('workout_program_id', program.id)

          if (daysError) throw daysError

          // Fetch all sessions for this program
          const sessionIds = programDays?.map((d: ProgramDay) => d.training_session_id) || []
          const { data: sessions, error: sessError } = await supabase
            .from('training_sessions')
            .select('*')
            .in('id', sessionIds)

          if (sessError) throw sessError

          // Map program days to sessions with their weekday
          const programSessionMap = new Map()
          programDays?.forEach((pd: ProgramDay) => {
            programSessionMap.set(pd.training_session_id, pd.weekday)
          })

          // Fetch exercises for each session
          const sessionsWithExercises = await Promise.all(
            (sessions || []).map(async (session: TrainingSession) => {
              const { data: sessionExercises, error: seError } = await supabase
                .from('session_exercises')
                .select('*')
                .eq('training_session_id', session.id)
                .order('sort_order', { ascending: true })

              if (seError) throw seError

              // Fetch exercise details
              const exerciseIds = sessionExercises?.map((se: SessionExercise) => se.exercise_id) || []
              const { data: exercises, error: exError } = await supabase
                .from('exercises')
                .select('*')
                .in('id', exerciseIds)

              if (exError) throw exError

              const exerciseMap = new Map(exercises?.map((e: Exercise) => [e.id, e]) || [])

              // Combine session exercises with exercise data
              const exercisesData = (sessionExercises || [])
                .map((se: SessionExercise) => {
                  const exercise = exerciseMap.get(se.exercise_id)
                  return {
                    id: se.exercise_id,
                    name: exercise?.name || '',
                    muscleGroup: exercise?.description || '',
                    targetSets: se.target_sets,
                    targetReps: se.target_reps,
                    targetDuration: se.target_duration_seconds,
                    restSeconds: se.rest_seconds,
                  }
                })

              const weekday = programSessionMap.get(session.id)

              return {
                id: session.id,
                name: session.name,
                muscleGroup: session.description || '',
                dayCode: weekdayToCode[weekday] || 'L',
                icon: 'fitness-outline',
                estimatedMinutes: session.estimated_duration_minutes,
                exercises: exercisesData,
                status: 'pending' as const,
                scheduledDate: new Date(),
              } as Session
            })
          )

          const weeklyDays = programDays?.map((pd: ProgramDay) => weekdayToCode[pd.weekday] || 'L') || []

          return {
            id: program.id,
            name: program.name,
            description: program.description,
            color: '#8B5CF6', // Default purple, could be stored in DB
            icon: 'barbell-outline',
            weeklyDays: weeklyDays as DayCode[],
            weeklyProgress: 0.5, // TODO: calculate from actual workouts
            sessionsCompleted: 0, // TODO: calculate from actual workouts
            sessionsTotal: sessionsWithExercises.length,
            status: 'active' as const,
            sessions: sessionsWithExercises,
          } as Program
        })
      )

      return enrichedPrograms
    },
  })
}

export function useTrainingProgramDetail(programId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.programDetail(programId),
    queryFn: async () => {
      const { data: program, error } = await supabase
        .from('workout_programs')
        .select(`
          *,
          program_days (
            *,
            training_sessions (*)
          )
        `)
        .eq('id', programId)
        .single()

      if (error) throw error
      return program
    },
    enabled: !!programId,
  })
}
