import { useQuery } from '@tanstack/react-query'

import { getEquipment, getExercise, getExercises, getMuscleGroups } from '@/api/exercises'
import { QUERY_KEYS } from '@/constants/query-keys'

export function useExercises(filters?: {
  muscleGroupId?: string
  equipmentId?: string
  difficulty?: string
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
