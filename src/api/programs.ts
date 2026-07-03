import { supabase } from '@/lib/supabase'
import type { WorkoutProgramRow, UserProgramRow, ProgramDayRow } from '@/types/database'

export type ProgramWithDays = WorkoutProgramRow & {
  program_days: (ProgramDayRow & {
    training_sessions: { id: string; name: string; estimated_duration_minutes: number | null }
  })[]
}

export type ActiveProgram = UserProgramRow & {
  workout_programs: ProgramWithDays
}

export async function getOfficialPrograms(): Promise<WorkoutProgramRow[]> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('type', 'official')
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function getUserOwnedPrograms(userId: string): Promise<WorkoutProgramRow[]> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('type', 'personal')
    .eq('owner_id', userId)
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function getProgram(id: string): Promise<ProgramWithDays | null> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select(`
      *,
      program_days (
        *,
        training_sessions ( id, name, estimated_duration_minutes )
      )
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as ProgramWithDays | null
}

export async function getActiveUserProgram(userId: string): Promise<ActiveProgram | null> {
  const { data, error } = await supabase
    .from('user_programs')
    .select(`
      *,
      workout_programs (
        *,
        program_days (
          *,
          training_sessions ( id, name, estimated_duration_minutes )
        )
      )
    `)
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as ActiveProgram | null
}

export async function assignProgram(userId: string, programId: string): Promise<UserProgramRow> {
  const { data, error } = await supabase
    .from('user_programs')
    .upsert(
      { user_id: userId, workout_program_id: programId, assigned_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createProgram(payload: {
  name: string
  description?: string | null
  owner_id: string
}): Promise<WorkoutProgramRow> {
  const { data, error } = await supabase
    .from('workout_programs')
    .insert({ ...payload, type: 'personal' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProgram(
  id: string,
  payload: { name?: string; description?: string | null }
): Promise<WorkoutProgramRow> {
  const { data, error } = await supabase
    .from('workout_programs')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProgram(id: string): Promise<void> {
  const { error } = await supabase
    .from('workout_programs')
    .update({ active: false })
    .eq('id', id)
  if (error) throw error
}

export async function duplicateProgram(
  sourceProgramId: string,
  userId: string,
  name: string
): Promise<WorkoutProgramRow> {
  const { data, error } = await supabase
    .from('workout_programs')
    .insert({
      name,
      type: 'personal',
      owner_id: userId,
      source_program_id: sourceProgramId,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
