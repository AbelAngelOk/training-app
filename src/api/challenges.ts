import { supabase } from '@/lib/supabase'
import {
  countActiveAssignments,
  getMaxActiveAssignments,
  isLimitViolation,
  ProgramLimitError,
} from '@/api/programs'
import type { AchievementRow, ContentStatus, UserProgramRow, WorkoutProgramRow } from '@/types/database'

export type ChallengeRow = WorkoutProgramRow & {
  duration_days: number
  achievement_id: string
}

export type ChallengeWithDays = ChallengeRow & {
  achievements: AchievementRow | null
  program_days: {
    day_number: number
    training_sessions: {
      id: string
      name: string
      estimated_duration_minutes: number | null
      session_exercises: {
        target_sets: number | null
        target_reps: number | null
        exercises: { name_es: string; name_en: string }
      }[]
    }
  }[]
}

export type ActiveChallenge = UserProgramRow & {
  workout_programs: ChallengeRow & {
    program_days: { day_number: number; training_session_id: string }[]
  }
}

export interface ChallengesPage {
  items: ChallengeRow[]
  nextOffset: number | null
}

export async function getChallenges(limit = 6): Promise<ChallengeRow[]> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('type', 'challenge')
    .eq('status', 'published')
    .order('name')
    .limit(limit)
  if (error) throw error
  return data as unknown as ChallengeRow[]
}

export async function getChallengesPage(params: {
  search?: string
  offset?: number
  limit?: number
}): Promise<ChallengesPage> {
  const { search = '', offset = 0, limit = 10 } = params
  let query = supabase
    .from('workout_programs')
    .select('*')
    .eq('type', 'challenge')
    .eq('status', 'published')
    .order('name')
    .range(offset, offset + limit - 1)

  if (search.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return {
    items: data as unknown as ChallengeRow[],
    nextOffset: data.length === limit ? offset + limit : null,
  }
}

export async function getChallenge(id: string): Promise<ChallengeWithDays | null> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select(`
      *,
      achievements ( * ),
      program_days (
        day_number,
        training_sessions (
          id, name, estimated_duration_minutes,
          session_exercises ( target_sets, target_reps, exercises ( name_es, name_en ) )
        )
      )
    `)
    .eq('id', id)
    .eq('type', 'challenge')
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const withSortedDays = {
    ...data,
    program_days: [...(data as any).program_days].sort(
      (a: any, b: any) => a.day_number - b.day_number
    ),
  }
  return withSortedDays as unknown as ChallengeWithDays
}

export async function getActiveChallenges(userId: string): Promise<ActiveChallenge[]> {
  const { data, error } = await supabase
    .from('user_programs')
    .select('*, workout_programs!inner ( *, program_days ( day_number, training_session_id ) )')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('workout_programs.type', 'challenge')
    .order('assigned_at', { ascending: false })
  if (error) throw error
  return data as unknown as ActiveChallenge[]
}

/**
 * Assigns a challenge to the user. Unlike assignProgram, challenges are not
 * deep-copied: their targets are fixed content, so user_programs points
 * straight at the template. Re-assigning an existing (deactivated) row
 * reactivates it instead of inserting (UNIQUE(user_id, workout_program_id)).
 */
export async function assignChallenge(userId: string, challengeId: string): Promise<UserProgramRow> {
  const [activeCount, maxAllowed] = await Promise.all([
    countActiveAssignments(userId, 'challenge'),
    getMaxActiveAssignments(userId),
  ])
  if (activeCount >= maxAllowed) throw new ProgramLimitError()

  const { data: existing, error: existingError } = await supabase
    .from('user_programs')
    .select('id')
    .eq('user_id', userId)
    .eq('workout_program_id', challengeId)
    .maybeSingle()
  if (existingError) throw existingError

  if (existing) {
    const { data, error } = await supabase
      .from('user_programs')
      .update({ is_active: true, deactivated_at: null })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) {
      if (isLimitViolation(error)) throw new ProgramLimitError()
      throw error
    }
    return data
  }

  const { data, error } = await supabase
    .from('user_programs')
    .insert({
      user_id: userId,
      workout_program_id: challengeId,
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

export type ChallengeAdminRow = ChallengeRow & {
  achievements: AchievementRow | null
  program_days: { count: number }[]
}

export interface ChallengePayload {
  name: string
  description?: string | null
  duration_days: number
  achievement_id: string
  status?: ContentStatus
}

/** Admin listing: every challenge regardless of status */
export async function getChallengesAdmin(filters?: { search?: string }): Promise<ChallengeAdminRow[]> {
  let query = supabase
    .from('workout_programs')
    .select('*, achievements ( * ), program_days(count)')
    .eq('type', 'challenge')
    .order('name')

  if (filters?.search?.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as unknown as ChallengeAdminRow[]
}

export async function createChallenge(payload: ChallengePayload): Promise<ChallengeRow> {
  const { data, error } = await supabase
    .from('workout_programs')
    .insert({ ...payload, type: 'challenge' })
    .select()
    .single()
  if (error) throw error
  return data as unknown as ChallengeRow
}

export async function updateChallenge(
  id: string,
  payload: Partial<ChallengePayload>
): Promise<ChallengeRow> {
  const { data, error } = await supabase
    .from('workout_programs')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as unknown as ChallengeRow
}

export async function setChallengeStatus(id: string, status: ContentStatus): Promise<ChallengeRow> {
  const { data, error } = await supabase
    .from('workout_programs')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as unknown as ChallengeRow
}

export async function deleteChallenge(id: string): Promise<void> {
  const { error } = await supabase.from('workout_programs').delete().eq('id', id)
  if (error) throw error
}
