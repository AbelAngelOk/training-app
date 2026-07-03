import { supabase } from '@/lib/supabase'
import type { TrainingSessionRow, SessionExerciseRow, ProgramDayRow, Weekday } from '@/types/database'

export type SessionWithExercises = TrainingSessionRow & {
  session_exercises: (SessionExerciseRow & {
    exercises: {
      id: string
      name: string
      image_url: string | null
      difficulty: string
      muscle_groups: { name: string }
    }
  })[]
}

export async function getSession(id: string): Promise<SessionWithExercises | null> {
  const { data, error } = await supabase
    .from('training_sessions')
    .select(`
      *,
      session_exercises (
        *,
        exercises (
          id,
          name,
          image_url,
          difficulty,
          muscle_groups ( name )
        )
      )
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as SessionWithExercises | null
}

export async function createSession(payload: {
  name: string
  description?: string | null
  estimated_duration_minutes?: number | null
  owner_id: string
}): Promise<TrainingSessionRow> {
  const { data, error } = await supabase
    .from('training_sessions')
    .insert({ ...payload, type: 'personal' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSession(
  id: string,
  payload: {
    name?: string
    description?: string | null
    estimated_duration_minutes?: number | null
  }
): Promise<TrainingSessionRow> {
  const { data, error } = await supabase
    .from('training_sessions')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addExerciseToSession(payload: {
  training_session_id: string
  exercise_id: string
  sort_order: number
  target_sets?: number | null
  target_reps?: number | null
  target_weight?: number | null
  target_duration_seconds?: number | null
  target_distance_meters?: number | null
  rest_seconds?: number | null
}): Promise<SessionExerciseRow> {
  const { data, error } = await supabase
    .from('session_exercises')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSessionExercise(
  id: string,
  payload: {
    sort_order?: number
    target_sets?: number | null
    target_reps?: number | null
    target_weight?: number | null
    target_duration_seconds?: number | null
    target_distance_meters?: number | null
    rest_seconds?: number | null
  }
): Promise<SessionExerciseRow> {
  const { data, error } = await supabase
    .from('session_exercises')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeExerciseFromSession(id: string): Promise<void> {
  const { error } = await supabase.from('session_exercises').delete().eq('id', id)
  if (error) throw error
}

export async function setProgramDay(payload: {
  workout_program_id: string
  weekday: Weekday
  training_session_id: string
}): Promise<ProgramDayRow> {
  const { data, error } = await supabase
    .from('program_days')
    .upsert(payload, { onConflict: 'workout_program_id,weekday' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeProgramDay(programId: string, weekday: Weekday): Promise<void> {
  const { error } = await supabase
    .from('program_days')
    .delete()
    .eq('workout_program_id', programId)
    .eq('weekday', weekday)
  if (error) throw error
}
