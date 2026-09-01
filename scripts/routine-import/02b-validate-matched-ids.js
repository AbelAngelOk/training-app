// Validates every matched_exercise_id an agent produced against the real
// database, since LLM-transcribed UUIDs occasionally get subtly corrupted.
// For any bad id, tries to recover by looking up matched_exercise_name_es
// (which the agent copied from a real catalog row) via exact name match.
require('dotenv').config()
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad'

async function main() {
  const routines = JSON.parse(fs.readFileSync(`${SCRATCH}/routine-import/resolved-routines.json`, 'utf8'))

  // Only the original 1595 could be "matched" (new exercises use freshly
  // generated ids we already know are correct) — fetch id+name_es for all.
  let allIds = new Set()
  let byNameEs = new Map()
  let offset = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase.from('exercises').select('id, name_es').range(offset, offset + PAGE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    for (const row of data) {
      allIds.add(row.id)
      if (!byNameEs.has(row.name_es)) byNameEs.set(row.name_es, [])
      byNameEs.get(row.name_es).push(row.id)
    }
    if (data.length < PAGE) break
    offset += PAGE
  }
  console.log(`Universo de ids válidos: ${allIds.size}`)

  let checked = 0
  let bad = 0
  let recovered = 0
  let unrecoverable = []

  for (const routine of routines) {
    for (const ex of routine.exercises) {
      if (!ex.matched_exercise_id) continue
      checked++
      if (allIds.has(ex.resolved_exercise_id)) continue

      bad++
      const candidates = ex.matched_exercise_name_es ? byNameEs.get(ex.matched_exercise_name_es) : null
      if (candidates && candidates.length === 1) {
        ex.resolved_exercise_id = candidates[0]
        ex.matched_exercise_id = candidates[0]
        recovered++
      } else {
        unrecoverable.push({
          routine: routine.session_name,
          source_name: ex.source_name,
          bad_id: ex.resolved_exercise_id,
          matched_exercise_name_es: ex.matched_exercise_name_es,
          candidateCount: candidates ? candidates.length : 0,
        })
      }
    }
  }

  console.log(`Chequeados: ${checked}, ids inválidos encontrados: ${bad}, recuperados por nombre: ${recovered}`)
  if (unrecoverable.length > 0) {
    console.log(`\nNo recuperables automáticamente (${unrecoverable.length}):`)
    console.log(JSON.stringify(unrecoverable, null, 2))
    fs.writeFileSync(`${SCRATCH}/routine-import/unrecoverable-ids.json`, JSON.stringify(unrecoverable, null, 2))
  }

  fs.writeFileSync(`${SCRATCH}/routine-import/resolved-routines.json`, JSON.stringify(routines, null, 2))
  console.log('\nresolved-routines.json actualizado con los ids corregidos.')

  if (unrecoverable.length > 0) {
    console.log('\n⚠️  Hay casos sin recuperar — revisar manualmente antes de reintentar la inserción.')
    process.exit(1)
  }
}

main()
