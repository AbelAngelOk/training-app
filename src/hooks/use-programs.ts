import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  assignProgram,
  createProgram,
  deleteProgram,
  duplicateProgram,
  getActiveUserProgram,
  getOfficialPrograms,
  getProgram,
  getUserOwnedPrograms,
  updateProgram,
} from '@/api/programs'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAuthStore } from '@/stores/auth-store'

export function useOfficialPrograms() {
  return useQuery({
    queryKey: QUERY_KEYS.PROGRAMS,
    queryFn: getOfficialPrograms,
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

export function useActiveUserProgram() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROGRAM,
    queryFn: () => getActiveUserProgram(user!.id),
    enabled: !!user,
  })
}

export function useAssignProgram() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (programId: string) => assignProgram(user!.id, programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROGRAM })
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
