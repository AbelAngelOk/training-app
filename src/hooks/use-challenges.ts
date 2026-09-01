import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  assignChallenge,
  createChallenge,
  deleteChallenge,
  getActiveChallenges,
  getChallenge,
  getChallenges,
  getChallengesAdmin,
  getChallengesPage,
  setChallengeStatus,
  updateChallenge,
  type ChallengePayload,
} from '@/api/challenges'
import { getCompletedSessionIds } from '@/api/workouts'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'
import type { ContentStatus } from '@/types/database'

export function useChallenges(limit = 6) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CHALLENGES, limit],
    queryFn: () => getChallenges(limit),
  })
}

/** Paginated challenges for the "ver todo" screen in Explore */
export function useInfiniteChallenges(search: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.CHALLENGES_PAGE(search),
    queryFn: ({ pageParam }) => getChallengesPage({ search, offset: pageParam, limit: 10 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  })
}

export function useChallenge(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CHALLENGE(id),
    queryFn: () => getChallenge(id),
    enabled: !!id,
  })
}

export function useActiveChallenges() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.ACTIVE_CHALLENGES,
    queryFn: () => getActiveChallenges(user!.id),
    enabled: !!user,
  })
}

/** All-time count of completed days for an active challenge (by its session ids) */
export function useChallengeProgress(sessionIds: string[]) {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: [...QUERY_KEYS.CHALLENGE_PROGRESS, sessionIds.slice().sort().join(',')],
    queryFn: () => getCompletedSessionIds(user!.id, sessionIds),
    enabled: !!user && sessionIds.length > 0,
  })
}

export function useAssignChallenge() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (challengeId: string) => assignChallenge(user!.id, challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_CHALLENGES })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROGRAMS })
    },
  })
}

/** Admin listing: every challenge regardless of status */
export function useChallengesAdmin(filters?: { search?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CHALLENGES, 'admin', filters],
    queryFn: () => getChallengesAdmin(filters),
  })
}

function useInvalidateChallenges() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHALLENGES })
    if (id) queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHALLENGE(id) })
  }
}

export function useCreateChallenge() {
  const invalidate = useInvalidateChallenges()
  return useMutation({
    mutationFn: (payload: ChallengePayload) => createChallenge(payload),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateChallenge() {
  const invalidate = useInvalidateChallenges()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<ChallengePayload>) =>
      updateChallenge(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useSetChallengeStatus() {
  const invalidate = useInvalidateChallenges()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatus }) =>
      setChallengeStatus(id, status),
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useDeleteChallenge() {
  const invalidate = useInvalidateChallenges()
  return useMutation({
    mutationFn: (id: string) => deleteChallenge(id),
    onSuccess: () => invalidate(),
  })
}
