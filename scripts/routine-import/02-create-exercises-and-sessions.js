// Stage 2: filters out non-exercise generic blocks, merges obvious near-duplicate
// proposals from different agents, creates the genuinely-new exercises, resolves
// every routine's exercise list to real ids, and inserts sessions/programs.
require('dotenv').config()
const fs = require('fs')
const crypto = require('crypto')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad'

function normalize(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

// Generic "blocks" that aren't discrete exercises (whole session summaries,
// non-physical items, or overly vague activity labels) — dropped, not created.
const REJECT_NAMES = [
  'Estiramientos',
  'Estiramientos y relajación (enfriamiento general)',
  'Estiramientos generales',
  'Pecho y hombros',
  'Piernas y cardio',
  'Yoga de relajación y estiramiento',
  'Calentamiento completo',
  'Fijar un objetivo',
  'Ejercicio cardiovascular',
  'Entrenamiento de fuerza',
  'Enfriamiento',
  'Yoga para enfriar y estirar',
  'Circuito HIIT de cuerpo completo',
  'Sesión de yoga (enfriamiento)',
  'Secuencia de yoga (saludo al sol, guerrero, árbol)',
  'Meditación y respiración',
  'Estiramientos en el agua',
  'Estiramientos dinámicos (rutina general)',
  'Coreografía de baile enérgico',
].map(normalize)

// Near-duplicate proposals from different agents describing the same movement
// with different wording — redirected to one canonical name before creation.
const MERGE_MAP = Object.fromEntries(
  [
    ['Media sentadilla elevando brazos', 'Media sentadilla con elevación de brazos'],
    ['Flexión de brazos y plancha lateral (combinado)', 'Flexión de brazos con rotación a plancha lateral'],
    ['Flexión de brazos y plancha lateral', 'Flexión de brazos con rotación a plancha lateral'],
    ['Elevación alterna de brazo y pierna en cuadrupedia (bird dog)', 'Elevación alterna de brazo y pierna en cuadrupedia'],
    ['Plancha con salto de rodillas al pecho', 'Plancha con flexión de piernas en salto'],
    ['Plancha y flexión de piernas', 'Plancha con flexión de piernas en salto'],
    ['Plancha y patada lateral', 'Plancha con patada lateral'],
    ['Rodillas al pecho con TRX (abdominales)', 'Abdominales con rodillas al pecho en TRX'],
    ['Sentadilla con press de hombros (thruster)', 'Sentadilla con press de hombros (thruster) con mancuernas'],
    ['Sentadilla con tirón y press de mancuerna sobre la cabeza', 'Sentadilla con press de hombros (thruster) con mancuernas'],
    ['Tirón frontal con mancuerna (sentadilla + press)', 'Sentadilla con press de hombros (thruster) con mancuernas'],
    ['Complejo con mancuernas: peso muerto + curl + press de hombros', 'Peso muerto + curl de bíceps + press de hombros (combo)'],
    ['Press de pecho con banda elástica', 'Press de pecho con banda'],
    ['Swing con kettlebell', 'Swing con pesa rusa'],
    ['Subir y bajar escaleras a diferentes velocidades y alturas', 'Subir y bajar escaleras'],
  ].map(([from, to]) => [normalize(from), to])
)

async function main() {
  // Batch 06 (Plan 088-100) excluded — see 01-merge-and-list-new.js comment.
  let routines = []
  for (let i = 0; i <= 5; i++) {
    const num = String(i).padStart(2, '0')
    routines = routines.concat(JSON.parse(fs.readFileSync(`${SCRATCH}/routines-extracted-${num}.json`, 'utf8')))
  }

  const { muscleGroups, equipment } = JSON.parse(fs.readFileSync(`${SCRATCH}/catalog-categories.json`, 'utf8'))
  const { data: mgRows } = await supabase.from('muscle_groups').select('id, name_es')
  const { data: eqRows } = await supabase.from('equipment').select('id, name_es')
  const mgIdByName = Object.fromEntries(mgRows.map((r) => [r.name_es, r.id]))
  const eqIdByName = Object.fromEntries(eqRows.map((r) => [r.name_es, r.id]))

  // Filter REJECT entries, apply MERGE_MAP, drop routines left with 0 exercises.
  let droppedGeneric = 0
  const filteredRoutines = []
  for (const routine of routines) {
    const keptExercises = []
    for (const ex of routine.exercises) {
      if (ex.proposed_new_exercise) {
        const key = normalize(ex.proposed_new_exercise.name_es)
        if (REJECT_NAMES.includes(key)) {
          droppedGeneric++
          continue
        }
        if (MERGE_MAP[key]) {
          ex.proposed_new_exercise.name_es = MERGE_MAP[key]
        }
      }
      keptExercises.push(ex)
    }
    if (keptExercises.length === 0) {
      console.log(`  ⏭️  Rutina sin ejercicios tras filtrar: "${routine.session_name}" — excluida`)
      continue
    }
    filteredRoutines.push({ ...routine, exercises: keptExercises })
  }
  console.log(`Bloques genéricos descartados: ${droppedGeneric}`)
  console.log(`Rutinas: ${routines.length} -> ${filteredRoutines.length} tras filtrar`)

  // Dedupe remaining proposed_new_exercise by (post-merge) normalized name_es.
  const proposedByKey = new Map()
  for (const routine of filteredRoutines) {
    for (const ex of routine.exercises) {
      if (ex.proposed_new_exercise) {
        const key = normalize(ex.proposed_new_exercise.name_es)
        if (!proposedByKey.has(key)) proposedByKey.set(key, ex.proposed_new_exercise)
      }
    }
  }
  console.log(`Ejercicios nuevos únicos a crear: ${proposedByKey.size}`)

  // Create the new exercises (id generated client-side so we can resolve
  // references immediately without a second DB round trip).
  const newExerciseIdByKey = new Map()
  const exerciseRows = []
  const muscleGroupRows = []
  const equipmentRows = []

  for (const [key, proposal] of proposedByKey) {
    const id = crypto.randomUUID()
    newExerciseIdByKey.set(key, id)

    const mgIds = proposal.muscle_groups.map((name) => {
      const mgId = mgIdByName[name]
      if (!mgId) throw new Error(`muscle_group desconocido: "${name}" (ejercicio: ${proposal.name_es})`)
      return mgId
    })
    const eqIds = (proposal.equipment || []).map((name) => {
      const eqId = eqIdByName[name]
      if (!eqId) throw new Error(`equipment desconocido: "${name}" (ejercicio: ${proposal.name_es})`)
      return eqId
    })

    exerciseRows.push({
      id,
      name_es: proposal.name_es,
      name_en: proposal.name_en,
      description_es: null,
      description_en: null,
      instructions_es: null,
      instructions_en: null,
      tips_es: null,
      tips_en: null,
      image_url: null,
      external_id: null,
      fitgifs_slug: null,
      difficulty: proposal.difficulty || 'intermediate',
      active: true,
    })
    for (const muscle_group_id of mgIds) muscleGroupRows.push({ exercise_id: id, muscle_group_id })
    for (const equipment_id of eqIds) equipmentRows.push({ exercise_id: id, equipment_id })
  }

  function chunk(arr, size) {
    const out = []
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
    return out
  }

  for (const batch of chunk(exerciseRows, 200)) {
    const { error } = await supabase.from('exercises').insert(batch)
    if (error) { console.error('insert exercises error:', error); process.exit(1) }
  }
  console.log(`Creados ${exerciseRows.length} ejercicios nuevos`)

  for (const batch of chunk(muscleGroupRows, 200)) {
    const { error } = await supabase.from('exercise_muscle_groups').insert(batch)
    if (error) { console.error('insert exercise_muscle_groups error:', error); process.exit(1) }
  }
  for (const batch of chunk(equipmentRows, 200)) {
    const { error } = await supabase.from('exercise_equipment').insert(batch)
    if (error) { console.error('insert exercise_equipment error:', error); process.exit(1) }
  }
  console.log(`Relaciones creadas: ${muscleGroupRows.length} muscle_groups, ${equipmentRows.length} equipment`)

  // Resolve every routine's exercises to final ids.
  for (const routine of filteredRoutines) {
    for (const ex of routine.exercises) {
      if (ex.matched_exercise_id) {
        ex.resolved_exercise_id = ex.matched_exercise_id
      } else if (ex.proposed_new_exercise) {
        const key = normalize(ex.proposed_new_exercise.name_es)
        ex.resolved_exercise_id = newExerciseIdByKey.get(key)
        if (!ex.resolved_exercise_id) throw new Error(`No se resolvió id para "${ex.proposed_new_exercise.name_es}"`)
      } else {
        throw new Error(`Ejercicio sin matched_exercise_id ni proposed_new_exercise: ${JSON.stringify(ex)}`)
      }
    }
  }

  fs.writeFileSync(`${SCRATCH}/routine-import/resolved-routines.json`, JSON.stringify(filteredRoutines, null, 2))
  console.log('\nEscrito resolved-routines.json — listo para el paso de creación de sesiones/programas.')
}

main()
