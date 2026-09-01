import { supabase } from '@/lib/supabase'
import type {
  ExerciseRow,
  MuscleGroupRow,
  EquipmentRow,
  ExerciseDifficulty,
} from '@/types/database'

export type ExerciseWithDetails = ExerciseRow & {
  muscle_groups: MuscleGroupRow[]
  equipment: EquipmentRow[]
}

const EXERCISE_SELECT =
  '*, exercise_muscle_groups(muscle_groups(*)), exercise_equipment(equipment(*))'

type RawExerciseRow = ExerciseRow & {
  exercise_muscle_groups: { muscle_groups: MuscleGroupRow }[]
  exercise_equipment: { equipment: EquipmentRow }[]
}

function flattenExercise(row: RawExerciseRow): ExerciseWithDetails {
  const { exercise_muscle_groups, exercise_equipment, ...rest } = row
  return {
    ...rest,
    muscle_groups: exercise_muscle_groups.map((r) => r.muscle_groups),
    equipment: exercise_equipment.map((r) => r.equipment),
  }
}

/** Resuelve ids de ejercicios que matchean TODOS los filtros de relación dados (AND entre grupo muscular y equipo, OR entre valores de un mismo filtro). Devuelve null si no hay filtros de relación. */
async function resolveExerciseIdsForFilters(filters: {
  muscleGroupIds?: string[]
  equipmentIds?: string[]
}): Promise<string[] | null> {
  const idSets: Set<string>[] = []

  if (filters.muscleGroupIds && filters.muscleGroupIds.length > 0) {
    const { data, error } = await supabase
      .from('exercise_muscle_groups')
      .select('exercise_id')
      .in('muscle_group_id', filters.muscleGroupIds)
    if (error) throw error
    idSets.push(new Set(data.map((r) => r.exercise_id)))
  }

  if (filters.equipmentIds && filters.equipmentIds.length > 0) {
    const { data, error } = await supabase
      .from('exercise_equipment')
      .select('exercise_id')
      .in('equipment_id', filters.equipmentIds)
    if (error) throw error
    idSets.push(new Set(data.map((r) => r.exercise_id)))
  }

  if (idSets.length === 0) return null

  const [first, ...rest] = idSets
  const intersection = rest.reduce(
    (acc, set) => new Set([...acc].filter((id) => set.has(id))),
    first
  )
  return [...intersection]
}

export async function getExercises(filters?: {
  muscleGroupId?: string
  equipmentId?: string
  difficulty?: ExerciseDifficulty
}): Promise<ExerciseWithDetails[]> {
  const matchingIds = await resolveExerciseIdsForFilters({
    muscleGroupIds: filters?.muscleGroupId ? [filters.muscleGroupId] : undefined,
    equipmentIds: filters?.equipmentId ? [filters.equipmentId] : undefined,
  })

  let query = supabase
    .from('exercises')
    .select(EXERCISE_SELECT)
    .eq('active', true)
    .order('name_es')

  if (matchingIds) {
    if (matchingIds.length === 0) return []
    query = query.in('id', matchingIds)
  }
  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  const { data, error } = await query
  if (error) throw error
  return (data as unknown as RawExerciseRow[]).map(flattenExercise)
}

/** Admin listing — includes inactive exercises by default, so they can be reactivated */
export async function getExercisesAdmin(filters?: {
  search?: string
  muscleGroupIds?: string[]
  equipmentIds?: string[]
}): Promise<ExerciseWithDetails[]> {
  const matchingIds = await resolveExerciseIdsForFilters({
    muscleGroupIds: filters?.muscleGroupIds,
    equipmentIds: filters?.equipmentIds,
  })

  let query = supabase.from('exercises').select(EXERCISE_SELECT).order('name_es')

  if (filters?.search?.trim()) {
    const term = filters.search.trim()
    query = query.or(`name_es.ilike.%${term}%,name_en.ilike.%${term}%`)
  }
  if (matchingIds) {
    if (matchingIds.length === 0) return []
    query = query.in('id', matchingIds)
  }

  const { data, error } = await query
  if (error) throw error
  return (data as unknown as RawExerciseRow[]).map(flattenExercise)
}

export interface ExercisePayload {
  name_es: string
  name_en: string
  description_es?: string | null
  description_en?: string | null
  instructions_es?: string | null
  instructions_en?: string | null
  tips_es?: string | null
  tips_en?: string | null
  image_url?: string | null
  external_id?: string | null
  fitgifs_slug?: string | null
  difficulty?: ExerciseDifficulty
  active?: boolean
  muscle_group_ids: string[]
  equipment_ids?: string[]
}

export async function createExercise(payload: ExercisePayload): Promise<string> {
  const { muscle_group_ids, equipment_ids, ...exercise } = payload
  const { data, error } = await supabase.rpc('upsert_exercise_with_relations', {
    p_id: null,
    p_exercise: exercise,
    p_muscle_group_ids: muscle_group_ids,
    p_equipment_ids: equipment_ids ?? null,
  })
  if (error) throw error
  return data
}

export async function updateExercise(id: string, payload: ExercisePayload): Promise<string> {
  const { muscle_group_ids, equipment_ids, ...exercise } = payload
  const { data, error } = await supabase.rpc('upsert_exercise_with_relations', {
    p_id: id,
    p_exercise: exercise,
    p_muscle_group_ids: muscle_group_ids,
    p_equipment_ids: equipment_ids ?? null,
  })
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
    .select(EXERCISE_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? flattenExercise(data as unknown as RawExerciseRow) : null
}

export async function getMuscleGroups(): Promise<MuscleGroupRow[]> {
  const { data, error } = await supabase.from('muscle_groups').select('*').order('name_es')
  if (error) throw error
  return data
}

export async function getEquipment(): Promise<EquipmentRow[]> {
  const { data, error } = await supabase.from('equipment').select('*').order('name_es')
  if (error) throw error
  return data
}

export interface CatalogItemPayload {
  name_es: string
  name_en: string
  description_es?: string | null
  description_en?: string | null
}

export async function createMuscleGroup(payload: CatalogItemPayload): Promise<MuscleGroupRow> {
  const { data, error } = await supabase.from('muscle_groups').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateMuscleGroup(
  id: string,
  payload: CatalogItemPayload
): Promise<MuscleGroupRow> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .update(payload)
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

export async function createEquipment(payload: CatalogItemPayload): Promise<EquipmentRow> {
  const { data, error } = await supabase.from('equipment').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateEquipment(
  id: string,
  payload: CatalogItemPayload
): Promise<EquipmentRow> {
  const { data, error } = await supabase
    .from('equipment')
    .update(payload)
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
