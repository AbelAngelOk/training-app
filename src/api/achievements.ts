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
  return data as UserAchievementWithDetail[]
}
