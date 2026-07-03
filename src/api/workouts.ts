import { supabase } from '@/lib/supabase'
import type {
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
      exercises: { id: string; name: string; image_url: string | null }
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
          exercises ( id, name, image_url )
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
          exercises ( id, name, image_url )
        ),
        workout_sets ( * )
      )
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as WorkoutExecutionWithDetails | null
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
