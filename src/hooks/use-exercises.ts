import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createEquipment,
  createExercise,
  createMuscleGroup,
  deactivateExercise,
  deleteEquipment,
  deleteExercise,
  deleteMuscleGroup,
  getEquipment,
  getExercise,
  getExercises,
  getExercisesAdmin,
  getMuscleGroups,
  reactivateExercise,
  updateEquipment,
  updateExercise,
  updateMuscleGroup,
  type CatalogItemPayload,
  type ExercisePayload,
} from '@/api/exercises'
import { QUERY_KEYS } from '@/constants/query-keys'
import type { ExerciseDifficulty } from '@/types/database'

export function useExercises(filters?: {
  muscleGroupId?: string
  equipmentId?: string
  difficulty?: ExerciseDifficulty
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EXERCISES, filters],
    queryFn: () => getExercises(filters),
  })
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EXERCISE(id),
    queryFn: () => getExercise(id),
    enabled: !!id,
  })
}

export function useMuscleGroups() {
  return useQuery({
    queryKey: QUERY_KEYS.MUSCLE_GROUPS,
    queryFn: getMuscleGroups,
    staleTime: Infinity,
  })
}

export function useEquipment() {
  return useQuery({
    queryKey: QUERY_KEYS.EQUIPMENT,
    queryFn: getEquipment,
    staleTime: Infinity,
  })
}

/** Admin listing (includes inactive exercises) */
export function useExercisesAdmin(filters?: {
  search?: string
  muscleGroupIds?: string[]
  equipmentIds?: string[]
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EXERCISES, 'admin', filters],
    queryFn: () => getExercisesAdmin(filters),
  })
}

function useInvalidateExercises() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES })
}

export function useCreateExercise() {
  const invalidate = useInvalidateExercises()
  return useMutation({
    mutationFn: (payload: ExercisePayload) => createExercise(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateExercise() {
  const invalidate = useInvalidateExercises()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & ExercisePayload) =>
      updateExercise(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteExercise() {
  const invalidate = useInvalidateExercises()
  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: invalidate,
  })
}

export function useDeactivateExercise() {
  const invalidate = useInvalidateExercises()
  return useMutation({
    mutationFn: (id: string) => deactivateExercise(id),
    onSuccess: invalidate,
  })
}

export function useReactivateExercise() {
  const invalidate = useInvalidateExercises()
  return useMutation({
    mutationFn: (id: string) => reactivateExercise(id),
    onSuccess: invalidate,
  })
}

function useInvalidateMuscleGroups() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MUSCLE_GROUPS })
}

export function useCreateMuscleGroup() {
  const invalidate = useInvalidateMuscleGroups()
  return useMutation({
    mutationFn: (payload: CatalogItemPayload) => createMuscleGroup(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateMuscleGroup() {
  const invalidate = useInvalidateMuscleGroups()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & CatalogItemPayload) =>
      updateMuscleGroup(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteMuscleGroup() {
  const invalidate = useInvalidateMuscleGroups()
  return useMutation({
    mutationFn: (id: string) => deleteMuscleGroup(id),
    onSuccess: invalidate,
  })
}

function useInvalidateEquipment() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EQUIPMENT })
}

export function useCreateEquipment() {
  const invalidate = useInvalidateEquipment()
  return useMutation({
    mutationFn: (payload: CatalogItemPayload) => createEquipment(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateEquipment() {
  const invalidate = useInvalidateEquipment()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & CatalogItemPayload) =>
      updateEquipment(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteEquipment() {
  const invalidate = useInvalidateEquipment()
  return useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: invalidate,
  })
}
