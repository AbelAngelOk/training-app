// Repair: the first insert run exited mid-batch (external_id collision) before
// reaching the junction-row insert step, so the exercises inserted in that
// first run never got their exercise_muscle_groups/exercise_equipment rows.
// Finds exercises (from this gif import) missing junction rows and inserts them.
require('dotenv').config()
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const SCRATCH = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad/gif-import'

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function fetchAllIds(table, column) {
  const ids = new Set()
  let offset = 0
  const limit = 1000
  while (true) {
    const { data, error } = await supabase.from(table).select(column).range(offset, offset + limit - 1)
    if (error) { console.error(error); process.exit(1) }
    if (!data || data.length === 0) break
    for (const row of data) ids.add(row[column])
    if (data.length < limit) break
    offset += limit
  }
  return ids
}

async function main() {
  const exercises = JSON.parse(fs.readFileSync(`${SCRATCH}/exercises-final.json`, 'utf8'))

  const mgExerciseIds = await fetchAllIds('exercise_muscle_groups', 'exercise_id')
  const eqExerciseIds = await fetchAllIds('exercise_equipment', 'exercise_id')

  const missingMg = exercises.filter((e) => !mgExerciseIds.has(e.id))
  const missingEq = exercises.filter((e) => !eqExerciseIds.has(e.id))
  console.log(`Exercises sin fila en exercise_muscle_groups: ${missingMg.length}`)
  console.log(`Exercises sin fila en exercise_equipment: ${missingEq.length}`)

  const mgRows = missingMg.flatMap((e) => e.muscle_group_ids.map((muscle_group_id) => ({ exercise_id: e.id, muscle_group_id })))
  const eqRows = missingEq.flatMap((e) => e.equipment_ids.map((equipment_id) => ({ exercise_id: e.id, equipment_id })))

  for (const batch of chunk(mgRows, 200)) {
    const { error } = await supabase.from('exercise_muscle_groups').insert(batch)
    if (error) { console.error('insert exercise_muscle_groups error:', error); process.exit(1) }
  }
  console.log(`Reparadas ${mgRows.length} filas en exercise_muscle_groups`)

  for (const batch of chunk(eqRows, 200)) {
    const { error } = await supabase.from('exercise_equipment').insert(batch)
    if (error) { console.error('insert exercise_equipment error:', error); process.exit(1) }
  }
  console.log(`Reparadas ${eqRows.length} filas en exercise_equipment`)
}

main()
