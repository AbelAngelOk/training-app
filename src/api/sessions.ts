import { supabase } from '@/lib/supabase'
import type {
  TrainingSessionRow,
  SessionExerciseRow,
  ProgramDayRow,
  ProgramType,
  Weekday,
  ExerciseRow,
} from '@/types/database'

export type SessionWithExercises = TrainingSessionRow & {
  session_exercises: (SessionExerciseRow & {
    exercises: ExerciseRow & {
      muscle_groups: { name: string } | null
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
          *,
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

/** Marks that the mandatory first-time setup wizard (rest + per-exercise targets) has run */
export async function markSessionTargetsConfigured(id: string): Promise<TrainingSessionRow> {
  const { data, error } = await supabase
    .from('training_sessions')
    .update({ targets_configured_at: new Date().toISOString() })
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

export async function setProgramDayByWeekday(payload: {
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

export async function removeProgramDayByWeekday(programId: string, weekday: Weekday): Promise<void> {
  const { error } = await supabase
    .from('program_days')
    .delete()
    .eq('workout_program_id', programId)
    .eq('weekday', weekday)
  if (error) throw error
}

export async function setProgramDayByDayNumber(payload: {
  workout_program_id: string
  day_number: number
  training_session_id: string
}): Promise<ProgramDayRow> {
  const { data, error } = await supabase
    .from('program_days')
    .upsert(payload, { onConflict: 'workout_program_id,day_number' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeProgramDayByDayNumber(programId: string, dayNumber: number): Promise<void> {
  const { error } = await supabase
    .from('program_days')
    .delete()
    .eq('workout_program_id', programId)
    .eq('day_number', dayNumber)
  if (error) throw error
}

export interface OfficialSessionPayload {
  name: string
  description?: string | null
  estimated_duration_minutes?: number | null
}

export type SessionAdminRow = TrainingSessionRow & { session_exercises: { count: number }[] }

/** Admin listing: official sessions with their exercise count */
export async function getSessionsAdmin(filters?: { search?: string }): Promise<SessionAdminRow[]> {
  let query = supabase
    .from('training_sessions')
    .select('*, session_exercises(count)')
    .eq('type', 'official')
    .order('name')

  if (filters?.search?.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as unknown as SessionAdminRow[]
}

export async function createOfficialSession(
  payload: OfficialSessionPayload
): Promise<TrainingSessionRow> {
  const { data, error } = await supabase
    .from('training_sessions')
    .insert({ ...payload, type: 'official' })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * `program_days.training_session_id` is ON DELETE CASCADE — deleting a
 * session still in use as a program/challenge day wouldn't fail, it would
 * silently leave that day without a session. Check before offering delete.
 * `workout_executions`/`calendar_events` reference the session with no
 * ON DELETE clause (RESTRICT-like) so execution history does raise a real
 * 23503 the UI can catch.
 */
export async function getSessionProgramDayUsage(sessionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('program_days')
    .select('id', { count: 'exact', head: true })
    .eq('training_session_id', sessionId)
  if (error) throw error
  return count ?? 0
}

export async function deleteOfficialSession(id: string): Promise<void> {
  const { error } = await supabase.from('training_sessions').delete().eq('id', id)
  if (error) throw error
}

export interface SessionProgramAssociation {
  id: string
  weekday: Weekday | null
  day_number: number | null
  workout_programs: { id: string; name: string; type: ProgramType }
}

/** Every program/challenge day this session is currently placed on */
export async function getSessionProgramAssociations(
  sessionId: string
): Promise<SessionProgramAssociation[]> {
  const { data, error } = await supabase
    .from('program_days')
    .select('id, weekday, day_number, workout_programs ( id, name, type )')
    .eq('training_session_id', sessionId)
  if (error) throw error
  return data as unknown as SessionProgramAssociation[]
}
