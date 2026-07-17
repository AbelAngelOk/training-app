import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  assignProgram,
  createOfficialProgram,
  createProgram,
  deleteOfficialProgram,
  deleteProgram,
  duplicateProgram,
  getActiveUserPrograms,
  getOfficialPrograms,
  getProgram,
  getProgramAssignmentCount,
  getProgramsAdmin,
  getProgramsPage,
  getProgramWithExercises,
  getUserProgramAssignments,
  getUserOwnedPrograms,
  setProgramStatus,
  setUserProgramActive,
  updateOfficialProgram,
  updateProgram,
  type OfficialProgramPayload,
} from '@/api/programs'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'
import type { ContentStatus } from '@/types/database'

export function useOfficialPrograms() {
  return useQuery({
    queryKey: QUERY_KEYS.PROGRAMS,
    queryFn: getOfficialPrograms,
  })
}

/** Paginated official programs for the "ver todo" screen in Explore */
export function useInfinitePrograms(search: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.PROGRAMS_PAGE(search),
    queryFn: ({ pageParam }) => getProgramsPage({ search, offset: pageParam, limit: 10 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  })
}

export function useUserOwnedPrograms() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: [...QUERY_KEYS.PROGRAMS, 'personal'],
    queryFn: () => getUserOwnedPrograms(user!.id),
    enabled: !!user,
  })
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROGRAM(id),
    queryFn: () => getProgram(id),
    enabled: !!id,
  })
}

/** Full exercise data per session, used by the Explore program preview */
export function useProgramWithExercises(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROGRAM(id), 'exercises'],
    queryFn: () => getProgramWithExercises(id),
    enabled: !!id,
  })
}

export function useActiveUserPrograms() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRAM,
    queryFn: () => getActiveUserPrograms(user!.id),
    enabled: !!user,
  })
}

export function useUserProgramAssignments() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRAMS,
    queryFn: () => getUserProgramAssignments(user!.id),
    enabled: !!user,
  })
}

export function useSetUserProgramActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userProgramId, active }: { userProgramId: string; active: boolean }) =>
      setUserProgramActive(userProgramId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROGRAM })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROGRAMS })
      // user_programs also backs challenge assignments, which the training
      // tab reads via a separate query key (useActiveChallenges) — without
      // this, toggling a challenge here left that screen showing stale data.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_CHALLENGES })
    },
  })
}

export function useAssignProgram() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (programId: string) => assignProgram(user!.id, programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROGRAM })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROGRAMS })
    },
  })
}

export function useCreateProgram() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (payload: { name: string; description?: string | null }) =>
      createProgram({ ...payload, owner_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRAMS })
    },
  })
}

export function useUpdateProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; description?: string | null }) =>
      updateProgram(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRAM(variables.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRAMS })
    },
  })
}

export function useDeleteProgram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRAMS })
    },
  })
}

export function useDuplicateProgram() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: ({ sourceProgramId, name }: { sourceProgramId: string; name: string }) =>
      duplicateProgram(sourceProgramId, user!.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRAMS })
    },
  })
}

/** Admin listing: every official program regardless of status */
export function useProgramsAdmin(filters?: { search?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROGRAMS, 'admin', filters],
    queryFn: () => getProgramsAdmin(filters),
  })
}

function useInvalidatePrograms() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRAMS })
    if (id) queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRAM(id) })
  }
}

export function useCreateOfficialProgram() {
  const invalidate = useInvalidatePrograms()
  return useMutation({
    mutationFn: (payload: OfficialProgramPayload) => createOfficialProgram(payload),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateOfficialProgram() {
  const invalidate = useInvalidatePrograms()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<OfficialProgramPayload>) =>
      updateOfficialProgram(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useSetProgramStatus() {
  const invalidate = useInvalidatePrograms()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatus }) =>
      setProgramStatus(id, status),
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useDeleteOfficialProgram() {
  const invalidate = useInvalidatePrograms()
  return useMutation({
    mutationFn: (id: string) => deleteOfficialProgram(id),
    onSuccess: () => invalidate(),
  })
}

export function useProgramAssignmentCount(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROGRAM(id), 'assignment-count'],
    queryFn: () => getProgramAssignmentCount(id),
    enabled: !!id,
  })
}
