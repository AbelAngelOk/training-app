import { supabase } from '@/lib/supabase'
import type {
  Weekday,
  WorkoutExecutionRow,
  WorkoutExerciseExecutionRow,
  WorkoutSetRow,
} from '@/types/database'

export type WorkoutExecutionWithDetails = WorkoutExecutionRow & {
  training_sessions: { id: string; name: string }
  workout_exercise_executions: (WorkoutExerciseExecutionRow & {
    session_exercises: {
      id: string
      sort_order: number
      target_sets: number | null
      target_reps: number | null
      target_weight: number | null
      exercises: { id: string; name_es: string; name_en: string; image_url: string | null }
    }
    workout_sets: WorkoutSetRow[]
  })[]
}

export async function startWorkout(payload: {
  user_id: string
  training_session_id: string
}): Promise<WorkoutExecutionRow> {
  const { data, error } = await supabase
    .from('workout_executions')
    .insert({
      ...payload,
      started_at: new Date().toISOString(),
      status: 'in_progress',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completeWorkout(
  executionId: string,
  durationSeconds: number
): Promise<WorkoutExecutionRow> {
  const { data, error } = await supabase
    .from('workout_executions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
    })
    .eq('id', executionId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cancelWorkout(executionId: string): Promise<WorkoutExecutionRow> {
  const { data, error } = await supabase
    .from('workout_executions')
    .update({ status: 'cancelled' })
    .eq('id', executionId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getActiveWorkout(userId: string): Promise<WorkoutExecutionWithDetails | null> {
  const { data, error } = await supabase
    .from('workout_executions')
    .select(`
      *,
      training_sessions ( id, name ),
      workout_exercise_executions (
        *,
        session_exercises (
          id, sort_order, target_sets, target_reps, target_weight,
          exercises ( id, name_es, name_en, image_url )
        ),
        workout_sets ( * )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .maybeSingle()
  if (error) throw error
  return data as WorkoutExecutionWithDetails | null
}

export async function getWorkoutHistory(
  userId: string,
  limit = 20,
  offset = 0
): Promise<WorkoutExecutionRow[]> {
  const { data, error } = await supabase
    .from('workout_executions')
    .select(`*, training_sessions ( id, name )`)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw error
  return data
}

export async function getWorkout(id: string): Promise<WorkoutExecutionWithDetails | null> {
  const { data, error } = await supabase
    .from('workout_executions')
    .select(`
      *,
      training_sessions ( id, name ),
      workout_exercise_executions (
        *,
        session_exercises (
          id, sort_order, target_sets, target_reps, target_weight,
          exercises ( id, name_es, name_en, image_url )
        ),
        workout_sets ( * )
      )
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as WorkoutExecutionWithDetails | null
}

export type SessionHistoryExecution = WorkoutExecutionRow & {
  training_session_id: string
  workout_exercise_executions: (WorkoutExerciseExecutionRow & {
    session_exercises: {
      id: string
      sort_order: number
      target_sets: number | null
      target_reps: number | null
      target_weight: number | null
      exercises: { name_es: string; name_en: string }
    }
    workout_sets: WorkoutSetRow[]
  })[]
}

export interface SessionExecutionHistory {
  executions: SessionHistoryExecution[]
  /** training_session_id -> planned weekday, for the "off schedule" check */
  plannedWeekdayBySession: Record<string, Weekday | null>
}

const HISTORY_LIMIT = 30

/**
 * Progress history for a session across time. Because official programs are
 * deep-copied per user on assignment (see duplicate_program_deep), successive
 * assignments produce distinct training_sessions rows that all share the same
 * root via source_session_id — this resolves that root and pulls executions
 * from every copy so reassigning the same program doesn't fragment history.
 */
export async function getSessionExecutionHistory(
  userId: string,
  sessionId: string
): Promise<SessionExecutionHistory> {
  const { data: session, error: sessionError } = await supabase
    .from('training_sessions')
    .select('id, source_session_id')
    .eq('id', sessionId)
    .maybeSingle()
  if (sessionError) throw sessionError
  if (!session) return { executions: [], plannedWeekdayBySession: {} }

  const root = session.source_session_id ?? session.id

  const { data: siblings, error: siblingsError } = await supabase
    .from('training_sessions')
    .select('id')
    .or(`id.eq.${root},source_session_id.eq.${root}`)
  if (siblingsError) throw siblingsError

  const sessionIds = (siblings ?? []).map((s) => s.id)
  if (sessionIds.length === 0) return { executions: [], plannedWeekdayBySession: {} }

  const [{ data: executions, error: executionsError }, { data: days, error: daysError }] =
    await Promise.all([
      supabase
        .from('workout_executions')
        .select(`
          *,
          workout_exercise_executions (
            *,
            session_exercises (
              id, sort_order, target_sets, target_reps, target_weight,
              exercises ( name_es, name_en )
            ),
            workout_sets ( * )
          )
        `)
        .eq('user_id', userId)
        .in('training_session_id', sessionIds)
        .order('started_at', { ascending: false })
        .range(0, HISTORY_LIMIT - 1),
      supabase.from('program_days').select('training_session_id, weekday').in('training_session_id', sessionIds),
    ])
  if (executionsError) throw executionsError
  if (daysError) throw daysError

  const plannedWeekdayBySession: Record<string, Weekday | null> = {}
  for (const day of days ?? []) {
    plannedWeekdayBySession[day.training_session_id] = day.weekday
  }

  return {
    executions: executions as unknown as SessionHistoryExecution[],
    plannedWeekdayBySession,
  }
}

/** Distinct sessions (of the given ids) with at least one completed execution, all-time */
export async function getCompletedSessionIds(
  userId: string,
  sessionIds: string[]
): Promise<string[]> {
  if (sessionIds.length === 0) return []
  const { data, error } = await supabase
    .from('workout_executions')
    .select('training_session_id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .in('training_session_id', sessionIds)
  if (error) throw error
  return [...new Set((data ?? []).map((d) => d.training_session_id))]
}

/** Completed executions (session id + date) used to mark calendar days as done */
export async function getCompletedExecutionDates(
  userId: string,
  sessionIds: string[],
  from: string,
  to: string
): Promise<{ training_session_id: string; completed_at: string }[]> {
  if (sessionIds.length === 0) return []
  const { data, error } = await supabase
    .from('workout_executions')
    .select('training_session_id, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .in('training_session_id', sessionIds)
    .gte('completed_at', from)
    .lte('completed_at', to)
  if (error) throw error
  return (data ?? []) as { training_session_id: string; completed_at: string }[]
}

export async function createExerciseExecution(payload: {
  workout_execution_id: string
  session_exercise_id: string
}): Promise<WorkoutExerciseExecutionRow> {
  const { data, error } = await supabase
    .from('workout_exercise_executions')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function logSet(payload: {
  workout_exercise_execution_id: string
  set_number: number
  weight?: number | null
  reps?: number | null
  duration_seconds?: number | null
  distance_meters?: number | null
}): Promise<WorkoutSetRow> {
  const { data, error } = await supabase
    .from('workout_sets')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSet(
  id: string,
  payload: {
    weight?: number | null
    reps?: number | null
    duration_seconds?: number | null
    distance_meters?: number | null
  }
): Promise<WorkoutSetRow> {
  const { data, error } = await supabase
    .from('workout_sets')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
