// Stage 5: bulk-inserts the final exercise rows + their junction rows
// (exercise_muscle_groups/exercise_equipment). Idempotent per-id: uses the
// client-generated uuid, so rerunning after a partial failure skips rows
// already present.
require('dotenv').config()
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const SCRATCH = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad/gif-import'
const BATCH_SIZE = 200

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  const exercises = JSON.parse(fs.readFileSync(`${SCRATCH}/exercises-final.json`, 'utf8'))

  const { data: existing, error: existingErr } = await supabase.from('exercises').select('id')
  if (existingErr) { console.error(existingErr); process.exit(1) }
  const existingIds = new Set(existing.map((r) => r.id))

  const toInsert = exercises.filter((e) => !existingIds.has(e.id))
  console.log(`${exercises.length} total, ${toInsert.length} pendientes de insertar (idempotente)`)

  const exerciseRows = toInsert.map((e) => ({
    id: e.id,
    name_es: e.name_es,
    name_en: e.name_en,
    description_es: null,
    description_en: null,
    instructions_es: null,
    instructions_en: null,
    tips_es: null,
    tips_en: null,
    image_url: e.image_url,
    // The manifest's "external_id" is a heuristically-detected slug, not a real
    // ExerciseDB id (that column's only real purpose is dedup against the
    // ExerciseDB catalog import) — leaving it set here both collides on the
    // UNIQUE constraint and would be a false "came from ExerciseDB" marker.
    external_id: null,
    fitgifs_slug: null,
    difficulty: e.difficulty,
    active: true,
  }))

  for (const batch of chunk(exerciseRows, BATCH_SIZE)) {
    const { error } = await supabase.from('exercises').insert(batch)
    if (error) { console.error('insert exercises batch error:', error); process.exit(1) }
    console.log(`  insertadas ${batch.length} exercises...`)
  }

  const muscleGroupRows = []
  const equipmentRows = []
  for (const e of toInsert) {
    for (const muscle_group_id of e.muscle_group_ids) muscleGroupRows.push({ exercise_id: e.id, muscle_group_id })
    for (const equipment_id of e.equipment_ids) equipmentRows.push({ exercise_id: e.id, equipment_id })
  }

  for (const batch of chunk(muscleGroupRows, BATCH_SIZE)) {
    const { error } = await supabase.from('exercise_muscle_groups').insert(batch)
    if (error) { console.error('insert exercise_muscle_groups batch error:', error); process.exit(1) }
  }
  console.log(`Insertadas ${muscleGroupRows.length} filas en exercise_muscle_groups`)

  for (const batch of chunk(equipmentRows, BATCH_SIZE)) {
    const { error } = await supabase.from('exercise_equipment').insert(batch)
    if (error) { console.error('insert exercise_equipment batch error:', error); process.exit(1) }
  }
  console.log(`Insertadas ${equipmentRows.length} filas en exercise_equipment`)

  console.log('OK: import de exercises completo.')
}

main()
