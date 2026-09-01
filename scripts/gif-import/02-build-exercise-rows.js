// Stage 2: builds the exercises-import.json dataset from the manifest — applies
// the 4 manual name_es corrections, generates a client-side uuid per exercise
// (so the storage object key and image_url are known before upload), and
// resolves muscle_group_ids/equipment_ids via category-map.json.
const fs = require('fs')
const crypto = require('crypto')

const SCRATCH = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad'
const SUPABASE_URL = 'https://ahmgdqufbxsteklkbwer.supabase.co'
const BUCKET = 'exercise-gifs'

const MANUAL_CORRECTIONS = {
  'Remada cavalinho (1).gif': 'Remo en polea (cavalinho)',
  'Remada cavalinho barra (1).gif': 'Remo en polea (cavalinho) barra',
  'remada cavalinha pegada aberta (1).gif': 'Remo en polea (cavalinho) agarre abierto',
  'remada cavalinho unilateral (1).gif': 'Remo en polea (cavalinho) unilateral',
}

const rows = JSON.parse(fs.readFileSync(`${SCRATCH}/manifest-rows.json`, 'utf8'))
const categoryMap = JSON.parse(fs.readFileSync(`${SCRATCH}/gif-import/category-map.json`, 'utf8'))

function resolveMuscleGroupId(label) {
  const normalized = categoryMap.muscleGroupSynonyms[label] || label
  const id = categoryMap.muscleGroupIdByName[normalized]
  if (!id) throw new Error(`No resuelve muscle_group: "${label}"`)
  return id
}
function resolveEquipmentId(label) {
  const normalized = categoryMap.equipmentSynonyms[label] || label
  const id = categoryMap.equipmentIdByName[normalized]
  if (!id) throw new Error(`No resuelve equipment: "${label}"`)
  return id
}

const exercises = rows.map((r) => {
  const id = crypto.randomUUID()
  const name_es = MANUAL_CORRECTIONS[r.original_filename] || r.name_es
  const muscle_group_ids = r.muscle_groups.split(';').map((s) => s.trim()).filter(Boolean).map(resolveMuscleGroupId)
  const equipment_ids = r.equipment.split(';').map((s) => s.trim()).filter(Boolean).map(resolveEquipmentId)
  return {
    id,
    name_es,
    difficulty: r.difficulty,
    external_id: r.external_id || null,
    muscle_group_ids: [...new Set(muscle_group_ids)],
    equipment_ids: [...new Set(equipment_ids)],
    image_url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${id}.gif`,
    storage_source_path: r.new_path,
  }
})

fs.writeFileSync(`${SCRATCH}/gif-import/exercises-import.json`, JSON.stringify(exercises, null, 2))

// distinct name_es list for translation (dedupe to reduce translation volume)
const distinctNames = [...new Set(exercises.map((e) => e.name_es))].sort()
fs.writeFileSync(`${SCRATCH}/gif-import/distinct-names-es.json`, JSON.stringify(distinctNames, null, 2))

console.log(`Total exercises: ${exercises.length}`)
console.log(`Distinct name_es: ${distinctNames.length}`)
console.log('Escritos exercises-import.json + distinct-names-es.json')
