import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addExerciseToSession,
  createOfficialSession,
  deleteOfficialSession,
  getSession,
  getSessionProgramAssociations,
  getSessionsAdmin,
  removeExerciseFromSession,
  removeProgramDayByDayNumber,
  removeProgramDayByWeekday,
  setProgramDayByDayNumber,
  setProgramDayByWeekday,
  updateSession,
  updateSessionExercise,
  type OfficialSessionPayload,
} from '@/api/sessions'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { Weekday } from '@/types/database'

export function useSession(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SESSION(id),
    queryFn: () => getSession(id),
    enabled: !!id,
  })
}

export function useUpdateSessionExercise(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Parameters<typeof updateSessionExercise>[1]) =>
      updateSessionExercise(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SESSION(sessionId) })
    },
  })
}

export function useAddExerciseToSession(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof addExerciseToSession>[0]) => addExerciseToSession(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SESSION(sessionId) }),
  })
}

export function useRemoveExerciseFromSession(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeExerciseFromSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SESSION(sessionId) }),
  })
}

/** Admin listing: official sessions with their exercise count */
export function useSessionsAdmin(filters?: { search?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SESSIONS, 'admin', filters],
    queryFn: () => getSessionsAdmin(filters),
  })
}

function useInvalidateSessions() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SESSIONS })
    if (id) queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SESSION(id) })
  }
}

export function useCreateOfficialSession() {
  const invalidate = useInvalidateSessions()
  return useMutation({
    mutationFn: (payload: OfficialSessionPayload) => createOfficialSession(payload),
    onSuccess: (data) => invalidate(data.id),
  })
}

export function useUpdateOfficialSession() {
  const invalidate = useInvalidateSessions()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<OfficialSessionPayload>) =>
      updateSession(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  })
}

export function useDeleteOfficialSession() {
  const invalidate = useInvalidateSessions()
  return useMutation({
    mutationFn: (id: string) => deleteOfficialSession(id),
    onSuccess: () => invalidate(),
  })
}

export function useSessionProgramAssociations(sessionId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SESSION(sessionId), 'associations'],
    queryFn: () => getSessionProgramAssociations(sessionId),
    enabled: !!sessionId,
  })
}

function useInvalidateProgramDays() {
  const queryClient = useQueryClient()
  return (programId: string, sessionId?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRAM(programId) })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHALLENGE(programId) })
    if (sessionId) {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.SESSION(sessionId), 'associations'] })
    }
  }
}

export function useSetProgramDayByWeekday() {
  const invalidate = useInvalidateProgramDays()
  return useMutation({
    mutationFn: (payload: Parameters<typeof setProgramDayByWeekday>[0]) =>
      setProgramDayByWeekday(payload),
    onSuccess: (_data, variables) =>
      invalidate(variables.workout_program_id, variables.training_session_id),
  })
}

export function useRemoveProgramDayByWeekday() {
  const invalidate = useInvalidateProgramDays()
  return useMutation({
    mutationFn: ({ programId, weekday }: { programId: string; weekday: Weekday }) =>
      removeProgramDayByWeekday(programId, weekday),
    onSuccess: (_data, variables) => invalidate(variables.programId),
  })
}

export function useSetProgramDayByDayNumber() {
  const invalidate = useInvalidateProgramDays()
  return useMutation({
    mutationFn: (payload: Parameters<typeof setProgramDayByDayNumber>[0]) =>
      setProgramDayByDayNumber(payload),
    onSuccess: (_data, variables) =>
      invalidate(variables.workout_program_id, variables.training_session_id),
  })
}

export function useRemoveProgramDayByDayNumber() {
  const invalidate = useInvalidateProgramDays()
  return useMutation({
    mutationFn: ({ programId, dayNumber }: { programId: string; dayNumber: number }) =>
      removeProgramDayByDayNumber(programId, dayNumber),
    onSuccess: (_data, variables) => invalidate(variables.programId),
  })
}
