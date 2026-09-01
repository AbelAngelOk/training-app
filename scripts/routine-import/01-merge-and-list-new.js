// Stage 1: merges the 7 agent-extracted routine batches, validates structure,
// and dumps the list of proposed_new_exercise entries for manual review before
// anything gets created.
const fs = require('fs')

const SCRATCH = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad'

// Batch 06 (Plan 088-100) is excluded: confirmed to be single-activity blocks
// with a duration but no real per-exercise sets/reps ("una de 100 opciones...
// bloques de actividad/cardio con duración, sin series/reps ni ejercicios
// individuales tradicionales" — the extracting agent's own assessment). This
// doesn't meet the "bien estructuradas" bar even though it passed the
// keyword-based file classifier (it has an "Estructura:" heading).
let allRoutines = []
for (let i = 0; i <= 5; i++) {
  const num = String(i).padStart(2, '0')
  const batch = JSON.parse(fs.readFileSync(`${SCRATCH}/routines-extracted-${num}.json`, 'utf8'))
  allRoutines = allRoutines.concat(batch)
}

console.log(`Total rutinas: ${allRoutines.length}`)
const totalExercises = allRoutines.reduce((s, r) => s + r.exercises.length, 0)
console.log(`Total ejercicios (posiciones): ${totalExercises}`)

fs.writeFileSync(`${SCRATCH}/routine-import/all-routines-merged.json`, JSON.stringify(allRoutines, null, 2))

// Dedupe proposed new exercises by normalized name_es
function normalize(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const proposedByName = new Map()
for (const routine of allRoutines) {
  for (const ex of routine.exercises) {
    if (ex.proposed_new_exercise) {
      const key = normalize(ex.proposed_new_exercise.name_es)
      if (!proposedByName.has(key)) {
        proposedByName.set(key, { ...ex.proposed_new_exercise, sourceCount: 0, sources: [] })
      }
      const entry = proposedByName.get(key)
      entry.sourceCount++
      entry.sources.push(`${routine.session_name} :: ${ex.source_name}`)
    }
  }
}

const proposedList = [...proposedByName.values()].sort((a, b) => b.sourceCount - a.sourceCount)
console.log(`Ejercicios nuevos propuestos (deduped por nombre): ${proposedList.length}`)

fs.writeFileSync(`${SCRATCH}/routine-import/proposed-new-exercises.json`, JSON.stringify(proposedList, null, 2))

// Also dump just the names for a quick read
fs.writeFileSync(
  `${SCRATCH}/routine-import/proposed-new-exercise-names.txt`,
  proposedList.map((e) => `${e.name_es} | ${e.name_en} | mg:${e.muscle_groups.join(',')} | eq:${e.equipment.join(',')} | x${e.sourceCount}`).join('\n')
)
console.log('Escrito proposed-new-exercise-names.txt para revisión')
