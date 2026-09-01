// Stage 3: creates training_sessions + session_exercises for every resolved
// routine, wraps each in a workout_programs (type=official, status=published)
// + program_days (required — a training_session isn't reachable by end users
// without one, per src/api/programs.ts). Two known multi-day pairs get bundled
// into a single 2-day program instead of two standalone ones.
require('dotenv').config()
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const SCRATCH = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad'

// source_file basename (no extension) -> multi-day program grouping
const MULTI_DAY_GROUPS = [
  {
    program_name: 'Entrenamiento para fútbol',
    days: ['Entrenamiento para fútbol - Día 1.', 'Entrenamiento para fútbol.Día 2.'],
  },
  {
    program_name: 'Plan de 1 mes — mejora la calidad muscular y reduce tu cintura',
    days: [
      'Plan de 1 mes. Mejora la calidad muscular y reduce tu cintura.Viernes de 1º y 2º semana.',
      'Plan de 1 mes. Mejora la calidad muscular y reduce tu cintura.Lunes de 3º y 4º semana.',
    ],
  },
]

function baseName(path) {
  const file = path.split('/').pop()
  return file.replace(/\.md$/i, '')
}

async function createSession(routine) {
  const { data: session, error } = await supabase
    .from('training_sessions')
    .insert({
      name: routine.session_name,
      description: routine.description || null,
      type: 'official',
      estimated_duration_minutes: routine.estimated_duration_minutes || null,
    })
    .select('id')
    .single()
  if (error) throw new Error(`training_sessions insert (${routine.session_name}): ${error.message}`)

  const rows = routine.exercises.map((ex, i) => ({
    training_session_id: session.id,
    exercise_id: ex.resolved_exercise_id,
    sort_order: i,
    target_sets: ex.target_sets ?? null,
    target_reps: ex.target_reps ?? null,
    target_weight: ex.target_weight ?? null,
    target_duration_seconds: ex.target_duration_seconds ?? null,
    rest_seconds: ex.rest_seconds ?? 60,
  }))
  const { error: seError } = await supabase.from('session_exercises').insert(rows)
  if (seError) throw new Error(`session_exercises insert (${routine.session_name}): ${seError.message}`)

  return session.id
}

async function createProgram(name, description, sessionIds) {
  const { data: program, error } = await supabase
    .from('workout_programs')
    .insert({ name, description: description || null, type: 'official', status: 'published' })
    .select('id')
    .single()
  if (error) throw new Error(`workout_programs insert (${name}): ${error.message}`)

  const dayRows = sessionIds.map((sessionId, i) => ({
    workout_program_id: program.id,
    training_session_id: sessionId,
    day_number: i + 1,
  }))
  const { error: pdError } = await supabase.from('program_days').insert(dayRows)
  if (pdError) throw new Error(`program_days insert (${name}): ${pdError.message}`)

  return program.id
}

async function main() {
  const routines = JSON.parse(fs.readFileSync(`${SCRATCH}/routine-import/resolved-routines.json`, 'utf8'))
  const routineByBase = new Map(routines.map((r) => [baseName(r.source_file), r]))

  const { data: existingPrograms } = await supabase.from('workout_programs').select('name').eq('type', 'official')
  const existingNames = new Set((existingPrograms || []).map((p) => p.name))

  const consumedBases = new Set()
  let programsCreated = 0
  let sessionsCreated = 0
  let skipped = 0

  // Multi-day groups first
  for (const group of MULTI_DAY_GROUPS) {
    const dayRoutines = group.days.map((base) => {
      const r = routineByBase.get(base)
      if (!r) throw new Error(`No se encontró la rutina para el día: "${base}"`)
      consumedBases.add(base)
      return r
    })
    if (existingNames.has(group.program_name)) { skipped++; continue }
    const sessionIds = []
    for (const routine of dayRoutines) {
      const id = await createSession(routine)
      sessionIds.push(id)
      sessionsCreated++
    }
    await createProgram(group.program_name, dayRoutines[0].description, sessionIds)
    programsCreated++
    console.log(`✅ Programa multi-día: "${group.program_name}" (${sessionIds.length} días)`)
  }

  // Standalone single-day routines
  for (const routine of routines) {
    const base = baseName(routine.source_file)
    if (consumedBases.has(base)) continue
    if (existingNames.has(routine.session_name)) { skipped++; continue }
    const sessionId = await createSession(routine)
    sessionsCreated++
    await createProgram(routine.session_name, routine.description, [sessionId])
    programsCreated++
    if (programsCreated % 10 === 0) console.log(`  ...${programsCreated} programas creados`)
  }
  console.log(`Saltados por ya existir (rerun idempotente): ${skipped}`)

  console.log(`\nCompleto: ${programsCreated} programas, ${sessionsCreated} sesiones oficiales creadas.`)
}

main().catch((err) => {
  console.error('❌', err.message)
  process.exit(1)
})
