import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  cancelWorkout,
  createExerciseExecution,
  getActiveWorkout,
  getSessionExecutionHistory,
  getWorkout,
  getWorkoutHistory,
  logSet,
  startWorkout,
  updateSet,
} from '@/api/workouts'
import { QUERY_KEYS } from '@/constants/query-keys'
import { buildSessionHistory } from '@/services/session-history-service'
import { completeWorkoutWithStats } from '@/services/workout-service'
import { useAuthStore } from '@/stores/auth-store'

export function useActiveWorkout() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKOUTS, 'active'],
    queryFn: () => getActiveWorkout(user!.id),
    enabled: !!user,
    refetchInterval: 30_000,
  })
}

export function useWorkoutHistory(limit = 20) {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.WORKOUT_HISTORY,
    queryFn: () => getWorkoutHistory(user!.id, limit),
    enabled: !!user,
  })
}

/** Progress history of a session (across time and across copies of the same root template) */
export function useSessionHistory(sessionId: string) {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: QUERY_KEYS.SESSION_HISTORY(sessionId),
    queryFn: async () => {
      const raw = await getSessionExecutionHistory(user!.id, sessionId)
      return buildSessionHistory(raw)
    },
    enabled: !!user && !!sessionId,
  })
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.WORKOUT(id),
    queryFn: () => getWorkout(id),
    enabled: !!id,
  })
}

export function useStartWorkout() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (sessionId: string) =>
      startWorkout({ user_id: user!.id, training_session_id: sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS })
    },
  })
}

export function useCompleteWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (executionId: string) => completeWorkoutWithStats(executionId),
    onSuccess: (_data, executionId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_HISTORY })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT(executionId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_STATS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ACHIEVEMENTS })
    },
  })
}

export function useCancelWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (executionId: string) => cancelWorkout(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS })
    },
  })
}

export function useCreateExerciseExecution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExerciseExecution,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WORKOUT(variables.workout_execution_id),
      })
    },
  })
}

export function useLogSet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS })
    },
  })
}

export function useUpdateSet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Parameters<typeof updateSet>[1]) =>
      updateSet(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUTS })
    },
  })
}
