import { supabase } from '@/lib/supabase'
import type { AchievementRow, UserAchievementRow } from '@/types/database'

export type UserAchievementWithDetail = UserAchievementRow & {
  achievements: AchievementRow
}

export async function getAchievements(): Promise<AchievementRow[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getUserAchievements(userId: string): Promise<UserAchievementWithDetail[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievements (*)')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
  if (error) throw error
  return data as unknown as UserAchievementWithDetail[]
}

export interface AchievementPayload {
  code: string
  name: string
  description?: string | null
}

export async function createAchievement(payload: AchievementPayload): Promise<AchievementRow> {
  const { data, error } = await supabase.from('achievements').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateAchievement(
  id: string,
  payload: Partial<AchievementPayload>
): Promise<AchievementRow> {
  const { data, error } = await supabase
    .from('achievements')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export interface AchievementUsage {
  challenges: number
  usersUnlocked: number
}

/**
 * `workout_programs.achievement_id` is ON DELETE SET NULL (a delete wouldn't
 * fail but would silently leave a challenge without an achievement) and
 * `user_achievements.achievement_id` is ON DELETE CASCADE (a delete would
 * silently wipe users' earned-achievement history). Check both before
 * offering delete — there is no soft-delete/status concept for achievements,
 * so a nonzero usage simply blocks the delete.
 */
export async function getAchievementUsage(achievementId: string): Promise<AchievementUsage> {
  const [challenges, usersUnlocked] = await Promise.all([
    supabase
      .from('workout_programs')
      .select('id', { count: 'exact', head: true })
      .eq('achievement_id', achievementId),
    supabase
      .from('user_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('achievement_id', achievementId),
  ])
  if (challenges.error) throw challenges.error
  if (usersUnlocked.error) throw usersUnlocked.error
  return { challenges: challenges.count ?? 0, usersUnlocked: usersUnlocked.count ?? 0 }
}

export async function deleteAchievement(id: string): Promise<void> {
  const { error } = await supabase.from('achievements').delete().eq('id', id)
  if (error) throw error
}
