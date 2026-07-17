import { supabase } from '@/lib/supabase'
import type {
  ExerciseRow,
  MuscleGroupRow,
  EquipmentRow,
  ExerciseDifficulty,
} from '@/types/database'

export type ExerciseWithDetails = ExerciseRow & {
  muscle_groups: MuscleGroupRow
  equipment: EquipmentRow | null
}

export async function getExercises(filters?: {
  muscleGroupId?: string
  equipmentId?: string
  difficulty?: ExerciseDifficulty
}): Promise<ExerciseWithDetails[]> {
  let query = supabase
    .from('exercises')
    .select('*, muscle_groups (*), equipment (*)')
    .eq('active', true)
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
  return data as unknown as ExerciseWithDetails[]
}

/** Admin listing — includes inactive exercises by default, so they can be reactivated */
export async function getExercisesAdmin(filters?: {
  search?: string
  muscleGroupId?: string
  equipmentId?: string
}): Promise<ExerciseWithDetails[]> {
  let query = supabase
    .from('exercises')
    .select('*, muscle_groups (*), equipment (*)')
    .order('name')

  if (filters?.search?.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`)
  }
  if (filters?.muscleGroupId) {
    query = query.eq('muscle_group_id', filters.muscleGroupId)
  }
  if (filters?.equipmentId) {
    query = query.eq('equipment_id', filters.equipmentId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as unknown as ExerciseWithDetails[]
}

export interface ExercisePayload {
  name: string
  description?: string | null
  instructions?: string | null
  image_url?: string | null
  tips?: string | null
  external_id?: string | null
  muscle_group_id: string
  equipment_id?: string | null
  difficulty?: ExerciseDifficulty
}

export async function createExercise(payload: ExercisePayload): Promise<ExerciseRow> {
  const { data, error } = await supabase.from('exercises').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateExercise(
  id: string,
  payload: Partial<ExercisePayload>
): Promise<ExerciseRow> {
  const { data, error } = await supabase
    .from('exercises')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Hard delete — throws with code '23503' if the exercise is still referenced by a session */
export async function deleteExercise(id: string): Promise<void> {
  const { error } = await supabase.from('exercises').delete().eq('id', id)
  if (error) throw error
}

/** Fallback when deleteExercise fails on FK RESTRICT: hides it from the mobile catalog instead */
export async function deactivateExercise(id: string): Promise<ExerciseRow> {
  const { data, error } = await supabase
    .from('exercises')
    .update({ active: false })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function reactivateExercise(id: string): Promise<ExerciseRow> {
  const { data, error } = await supabase
    .from('exercises')
    .update({ active: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
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

export async function createMuscleGroup(name: string): Promise<MuscleGroupRow> {
  const { data, error } = await supabase.from('muscle_groups').insert({ name }).select().single()
  if (error) throw error
  return data
}

export async function updateMuscleGroup(id: string, name: string): Promise<MuscleGroupRow> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Hard delete — throws with code '23503' if in use by an exercise (FK has no ON DELETE clause) */
export async function deleteMuscleGroup(id: string): Promise<void> {
  const { error } = await supabase.from('muscle_groups').delete().eq('id', id)
  if (error) throw error
}

export async function createEquipment(name: string): Promise<EquipmentRow> {
  const { data, error } = await supabase.from('equipment').insert({ name }).select().single()
  if (error) throw error
  return data
}

export async function updateEquipment(id: string, name: string): Promise<EquipmentRow> {
  const { data, error } = await supabase
    .from('equipment')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Hard delete — throws with code '23503' if in use by an exercise (FK has no ON DELETE clause) */
export async function deleteEquipment(id: string): Promise<void> {
  const { error } = await supabase.from('equipment').delete().eq('id', id)
  if (error) throw error
}
