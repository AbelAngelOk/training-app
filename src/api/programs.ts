import { supabase } from '@/lib/supabase'
import type {
  ContentStatus,
  WorkoutProgramRow,
  UserProgramRow,
  ProgramDayRow,
  MuscleGroupRow,
} from '@/types/database'

export type ProgramWithDays = WorkoutProgramRow & {
  program_days: (ProgramDayRow & {
    training_sessions: {
      id: string
      name: string
      estimated_duration_minutes: number | null
      session_exercises: { count: number }[]
    }
  })[]
}

export type ActiveProgram = UserProgramRow & {
  workout_programs: ProgramWithDays
}

export type UserProgramAssignment = UserProgramRow & {
  workout_programs: Pick<WorkoutProgramRow, 'id' | 'name' | 'description' | 'type' | 'status'>
}

/** Thrown when the user's plan does not allow another active program/challenge */
export class ProgramLimitError extends Error {
  constructor() {
    super('PROGRAM_LIMIT_REACHED')
    this.name = 'ProgramLimitError'
  }
}

export function isLimitViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    String((error as { message: unknown }).message).includes('PROGRAM_LIMIT_REACHED')
  )
}

export async function getOfficialPrograms(): Promise<WorkoutProgramRow[]> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('type', 'official')
    .eq('status', 'published')
    .order('name')
  if (error) throw error
  return data
}

export interface ProgramsPage {
  items: WorkoutProgramRow[]
  nextOffset: number | null
}

/** Paginated official programs for the "ver todo" screen, with optional name search */
export async function getProgramsPage(params: {
  search?: string
  offset?: number
  limit?: number
}): Promise<ProgramsPage> {
  const { search = '', offset = 0, limit = 10 } = params
  let query = supabase
    .from('workout_programs')
    .select('*')
    .eq('type', 'official')
    .eq('status', 'published')
    .order('name')
    .range(offset, offset + limit - 1)

  if (search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return {
    items: data,
    nextOffset: data.length === limit ? offset + limit : null,
  }
}

export async function getUserOwnedPrograms(userId: string): Promise<WorkoutProgramRow[]> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('type', 'personal')
    .eq('owner_id', userId)
    .eq('status', 'published')
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
        training_sessions ( id, name, estimated_duration_minutes, session_exercises(count) )
      )
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as ProgramWithDays | null
}

export type ProgramWithFullExercises = WorkoutProgramRow & {
  program_days: (ProgramDayRow & {
    training_sessions: {
      id: string
      name: string
      estimated_duration_minutes: number | null
      session_exercises: {
        id: string
        target_sets: number | null
        target_reps: number | null
        rest_seconds: number | null
        exercises: { id: string; name_es: string; name_en: string; muscle_groups: MuscleGroupRow[] }
      }[]
    }
  })[]
}

type RawProgramExercise = {
  id: string
  target_sets: number | null
  target_reps: number | null
  rest_seconds: number | null
  exercises: {
    id: string
    name_es: string
    name_en: string
    exercise_muscle_groups: { muscle_groups: MuscleGroupRow }[]
  }
}

/** Program detail with full exercise data per session (for the Explore preview) */
export async function getProgramWithExercises(id: string): Promise<ProgramWithFullExercises | null> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select(`
      *,
      program_days (
        *,
        training_sessions (
          id, name, estimated_duration_minutes,
          session_exercises (
            id, target_sets, target_reps, rest_seconds,
            exercises ( id, name_es, name_en, exercise_muscle_groups ( muscle_groups (*) ) )
          )
        )
      )
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const raw = data as unknown as WorkoutProgramRow & {
    program_days: (ProgramDayRow & {
      training_sessions: {
        id: string
        name: string
        estimated_duration_minutes: number | null
        session_exercises: RawProgramExercise[]
      }
    })[]
  }

  return {
    ...raw,
    program_days: raw.program_days.map((pd) => ({
      ...pd,
      training_sessions: {
        ...pd.training_sessions,
        session_exercises: pd.training_sessions.session_exercises.map((se) => {
          const { exercise_muscle_groups, ...exercise } = se.exercises
          return {
            ...se,
            exercises: {
              ...exercise,
              muscle_groups: exercise_muscle_groups.map((r) => r.muscle_groups),
            },
          }
        }),
      },
    })),
  }
}

/** Active program assignments (challenges excluded — they have their own list) */
export async function getActiveUserPrograms(userId: string): Promise<ActiveProgram[]> {
  const { data, error } = await supabase
    .from('user_programs')
    .select(`
      *,
      workout_programs!inner (
        *,
        program_days (
          *,
          training_sessions ( id, name, estimated_duration_minutes, session_exercises(count) )
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .neq('workout_programs.type', 'challenge')
    .order('assigned_at', { ascending: false })
  if (error) throw error
  return data as unknown as ActiveProgram[]
}

/** Every assignment of the user (active and deactivated), newest first */
export async function getUserProgramAssignments(
  userId: string
): Promise<UserProgramAssignment[]> {
  const { data, error } = await supabase
    .from('user_programs')
    .select('*, workout_programs!inner ( id, name, description, type, status )')
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false })
  if (error) throw error
  return data as unknown as UserProgramAssignment[]
}

export async function setUserProgramActive(
  userProgramId: string,
  active: boolean
): Promise<UserProgramRow> {
  const { data, error } = await supabase
    .from('user_programs')
    .update({
      is_active: active,
      deactivated_at: active ? null : new Date().toISOString(),
    })
    .eq('id', userProgramId)
    .select()
    .single()
  if (error) {
    if (isLimitViolation(error)) throw new ProgramLimitError()
    throw error
  }
  return data
}

/**
 * Deep-copies a program (days + sessions + exercises) as a personal copy of
 * the current user via the duplicate_program_deep RPC. Returns the new program id.
 */
export async function duplicateProgramDeep(
  sourceProgramId: string,
  name?: string
): Promise<string> {
  const { data, error } = await supabase.rpc('duplicate_program_deep', {
    p_source_program_id: sourceProgramId,
    p_name: name ?? null,
  })
  if (error) throw error
  return data as string
}

/**
 * Active assignment count for the user, split by kind (mirrors the DB
 * trigger's own count). Shared by assignProgram and assignChallenge.
 */
export async function countActiveAssignments(
  userId: string,
  kind: 'program' | 'challenge'
): Promise<number> {
  let query = supabase
    .from('user_programs')
    .select('id, workout_programs!inner(type)', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)

  query =
    kind === 'challenge'
      ? query.eq('workout_programs.type', 'challenge')
      : query.neq('workout_programs.type', 'challenge')

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

export async function getMaxActiveAssignments(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['active', 'grace_period'])
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ? 3 : 1
}

export async function assignProgram(userId: string, programId: string): Promise<UserProgramRow> {
  // Pre-check the plan limit before duplicating so a rejected assignment does
  // not leave an orphan personal copy. The DB trigger remains the hard guarantee.
  const [activeCount, maxAllowed] = await Promise.all([
    countActiveAssignments(userId, 'program'),
    getMaxActiveAssignments(userId),
  ])
  if (activeCount >= maxAllowed) throw new ProgramLimitError()

  // Official programs are shared templates (RLS forbids editing their targets),
  // so the user gets a personal deep copy and the assignment points to the copy.
  const { data: program, error: programError } = await supabase
    .from('workout_programs')
    .select('id, type')
    .eq('id', programId)
    .single()
  if (programError) throw programError

  const programToAssign =
    program.type === 'official' ? await duplicateProgramDeep(programId) : programId

  // Re-assigning a program that already has a (deactivated) assignment row
  // re-activates it instead of inserting (UNIQUE(user_id, workout_program_id)).
  const { data: existing, error: existingError } = await supabase
    .from('user_programs')
    .select('id')
    .eq('user_id', userId)
    .eq('workout_program_id', programToAssign)
    .maybeSingle()
  if (existingError) throw existingError

  if (existing) {
    return setUserProgramActive(existing.id, true)
  }

  const { data, error } = await supabase
    .from('user_programs')
    .insert({
      user_id: userId,
      workout_program_id: programToAssign,
      assigned_at: new Date().toISOString(),
      is_active: true,
    })
    .select()
    .single()
  if (error) {
    if (isLimitViolation(error)) throw new ProgramLimitError()
    throw error
  }
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
    .update({ status: 'archived' })
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

export type ProgramAdminRow = WorkoutProgramRow & { program_days: { count: number }[] }

export interface OfficialProgramPayload {
  name: string
  description?: string | null
  status?: ContentStatus
}

/** Admin listing: every official program regardless of status */
export async function getProgramsAdmin(filters?: { search?: string }): Promise<ProgramAdminRow[]> {
  let query = supabase
    .from('workout_programs')
    .select('*, program_days(count)')
    .eq('type', 'official')
    .order('name')

  if (filters?.search?.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as unknown as ProgramAdminRow[]
}

export async function createOfficialProgram(
  payload: OfficialProgramPayload
): Promise<WorkoutProgramRow> {
  const { data, error } = await supabase
    .from('workout_programs')
    .insert({ ...payload, type: 'official' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateOfficialProgram(
  id: string,
  payload: Partial<OfficialProgramPayload>
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

export async function setProgramStatus(
  id: string,
  status: ContentStatus
): Promise<WorkoutProgramRow> {
  const { data, error } = await supabase
    .from('workout_programs')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * `user_programs.workout_program_id` is ON DELETE CASCADE, so hard-deleting a
 * program/challenge with existing assignments would silently wipe user
 * history instead of raising an FK error. Check usage before offering delete.
 */
export async function getProgramAssignmentCount(programId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_programs')
    .select('id', { count: 'exact', head: true })
    .eq('workout_program_id', programId)
  if (error) throw error
  return count ?? 0
}

export async function deleteOfficialProgram(id: string): Promise<void> {
  const { error } = await supabase.from('workout_programs').delete().eq('id', id)
  if (error) throw error
}
