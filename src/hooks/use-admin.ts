import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { getAdminOverviewStats, getUsersAdmin, setUserRole } from '@/api/admin'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/database'

async function getOwnRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data.role
}

/** Current user's role, used to gate the /admin portal */
export function useAdminRole() {
  const user = useAuthStore((s) => s.user)
  const query = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: () => getOwnRole(user!.id),
    enabled: !!user,
  })
  return {
    role: query.data,
    isAdmin: query.data === 'admin',
    isLoading: query.isLoading,
  }
}

export function useUsersAdmin(filters?: { search?: string }) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => getUsersAdmin(filters),
  })
}

export function useSetUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => setUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useAdminOverviewStats() {
  return useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: getAdminOverviewStats,
  })
}
