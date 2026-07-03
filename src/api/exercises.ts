import { supabase } from '@/lib/supabase'
import type { ExerciseRow, MuscleGroupRow, EquipmentRow } from '@/types/database'

export type ExerciseWithDetails = ExerciseRow & {
  muscle_groups: MuscleGroupRow
  equipment: EquipmentRow | null
}

export async function getExercises(filters?: {
  muscleGroupId?: string
  equipmentId?: string
  difficulty?: string
}): Promise<ExerciseWithDetails[]> {
  let query = supabase
    .from('exercises')
    .select('*, muscle_groups (*), equipment (*)')
    .order('name')

  if (filters?.muscleGroupId) {
    query = query.eq('muscle_group_id', filters.muscleGroupId)
  }
  if (filters?.equipmentId) {
    query = query.eq('equipment_id', filters.equipmentId)
  }
  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  const { data, error } = await query
  if (error) throw error
  return data as ExerciseWithDetails[]
}

export async function getExercise(id: string): Promise<ExerciseWithDetails | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*, muscle_groups (*), equipment (*)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as ExerciseWithDetails | null
}

export async function getMuscleGroups(): Promise<MuscleGroupRow[]> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getEquipment(): Promise<EquipmentRow[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}
