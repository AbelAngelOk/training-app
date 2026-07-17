import { supabase } from '@/lib/supabase'
import type { ContentStatus, UserRole } from '@/types/database'

export interface AdminUserRow {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export async function getUsersAdmin(filters?: { search?: string }): Promise<AdminUserRow[]> {
  let query = supabase
    .from('users')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })

  if (filters?.search?.trim()) {
    query = query.ilike('email', `%${filters.search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function setUserRole(userId: string, role: UserRole): Promise<AdminUserRow> {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select('id, email, role, created_at')
    .single()
  if (error) throw error
  return data
}

export interface AdminOverviewStats {
  usersByRole: Record<UserRole, number>
  programsByStatus: Record<ContentStatus, number>
  challengesByStatus: Record<ContentStatus, number>
  completedWorkoutsLast7Days: number
}

/** Counts run in parallel with {count:'exact', head:true} — same pattern as countActiveAssignments */
export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    freeUsers,
    premiumUsers,
    coaches,
    admins,
    draftPrograms,
    publishedPrograms,
    archivedPrograms,
    draftChallenges,
    publishedChallenges,
    archivedChallenges,
    completedWorkouts,
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'free_user'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'premium_user'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'coach'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase
      .from('workout_programs')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'official')
      .eq('status', 'draft'),
    supabase
      .from('workout_programs')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'official')
      .eq('status', 'published'),
    supabase
      .from('workout_programs')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'official')
      .eq('status', 'archived'),
    supabase
      .from('workout_programs')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'challenge')
      .eq('status', 'draft'),
    supabase
      .from('workout_programs')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'challenge')
      .eq('status', 'published'),
    supabase
      .from('workout_programs')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'challenge')
      .eq('status', 'archived'),
    supabase
      .from('workout_executions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', sevenDaysAgo),
  ])

  const results = [
    freeUsers,
    premiumUsers,
    coaches,
    admins,
    draftPrograms,
    publishedPrograms,
    archivedPrograms,
    draftChallenges,
    publishedChallenges,
    archivedChallenges,
    completedWorkouts,
  ]
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error

  return {
    usersByRole: {
      free_user: freeUsers.count ?? 0,
      premium_user: premiumUsers.count ?? 0,
      coach: coaches.count ?? 0,
      admin: admins.count ?? 0,
    },
    programsByStatus: {
      draft: draftPrograms.count ?? 0,
      published: publishedPrograms.count ?? 0,
      archived: archivedPrograms.count ?? 0,
    },
    challengesByStatus: {
      draft: draftChallenges.count ?? 0,
      published: publishedChallenges.count ?? 0,
      archived: archivedChallenges.count ?? 0,
    },
    completedWorkoutsLast7Days: completedWorkouts.count ?? 0,
  }
}
