// @ts-nocheck
/**
 * Script para agregar más ejercicios a las sesiones existentes
 * Expande las sesiones con ejercicios complementarios manteniendo la estructura
 */

require('dotenv').config()

async function main() {
  const { createClient } = await import('@supabase/supabase-js')

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials (EXPO_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🌱 Agregando más ejercicios a sesiones existentes...\n')

  // ---------------------------------------------------------------------------
  // 1. Cargar ejercicios y sesiones
  // ---------------------------------------------------------------------------
  console.log('📦 Cargando datos...')
  const { data: exercises, error: exError } = await supabase
    .from('exercises')
    .select('id, name, muscle_group_id')

  if (exError) { console.error('❌ exercises:', exError.message); process.exit(1) }

  const { data: sessions, error: sessError } = await supabase
    .from('training_sessions')
    .select('id, name')

  if (sessError) { console.error('❌ training_sessions:', sessError.message); process.exit(1) }

  const { data: existing, error: existError } = await supabase
    .from('session_exercises')
    .select('training_session_id, exercise_id')

  if (existError) { console.error('❌ session_exercises:', existError.message); process.exit(1) }

  const ex = Object.fromEntries(exercises.map((e) => [e.name, e]))
  const exBySession = new Map()

  existing.forEach((se) => {
    if (!exBySession.has(se.training_session_id)) {
      exBySession.set(se.training_session_id, new Set())
    }
    exBySession.get(se.training_session_id).add(se.exercise_id)
  })

  console.log(`✅ ${exercises.length} ejercicios encontrados`)
  console.log(`✅ ${sessions.length} sesiones encontradas`)

  // ---------------------------------------------------------------------------
  // 2. Definir ejercicios complementarios por sesión
  // ---------------------------------------------------------------------------
  const sessionExercises = {
    // Full Body A: agregar más ejercicio de espalda y core
    'Full Body A': [
      { name: 'Dominadas', sets: 3, reps: 8, rest: 90 },
      { name: 'Russian twist', sets: 3, reps: 20, rest: 45 },
    ],
    // Full Body B: agregar más pecho y leg accessories
    'Full Body B': [
      { name: 'Flexiones', sets: 3, reps: 12, rest: 60 },
      { name: 'Curl femoral acostado', sets: 3, reps: 12, rest: 60 },
    ],
    // Full Body C: agregar más trabajo de core y accesorios
    'Full Body C': [
      { name: 'Elevación de piernas', sets: 3, reps: 12, rest: 60 },
      { name: 'Pantalones de paralelas', sets: 3, reps: 12, rest: 60 },
    ],
    // Push: agregar accesorios de hombro y pecho
    'Push — Empuje': [
      { name: 'Aperturas con mancuernas', sets: 3, reps: 12, rest: 60 },
      { name: 'Elevaciones frontales', sets: 3, reps: 12, rest: 45 },
      { name: 'Fondos en paralelas', sets: 3, reps: 10, rest: 75 },
    ],
    // Pull: agregar más volumen de espalda y bíceps
    'Pull — Jale': [
      { name: 'Pullover con mancuerna', sets: 3, reps: 10, rest: 60 },
      { name: 'Pájaros', sets: 3, reps: 15, rest: 45 },
      { name: 'Curl en polea baja', sets: 3, reps: 12, rest: 45 },
    ],
    // Legs: agregar accesorios de pierna
    'Legs — Piernas': [
      { name: 'Peso muerto rumano', sets: 3, reps: 10, rest: 90 },
      { name: 'Zancadas con mancuernas', sets: 3, reps: 12, rest: 60 },
      { name: 'Elevación de talones sentado', sets: 3, reps: 15, rest: 45 },
    ],
    // Upper: agregar más work de espalda
    'Upper — Torso': [
      { name: 'Jalón al pecho', sets: 3, reps: 12, rest: 60 },
      { name: 'Elevaciones laterales', sets: 3, reps: 15, rest: 45 },
    ],
    // Sesión A (5x5): agregar accesorios
    'Sesión A — Sentadilla, Banca, Remo': [
      { name: 'Dominadas', sets: 3, reps: 8, rest: 90 },
      { name: 'Curl con mancuernas', sets: 3, reps: 10, rest: 60 },
    ],
    // Sesión B (5x5): agregar accesorios
    'Sesión B — Sentadilla, Press, Peso Muerto': [
      { name: 'Jalón al pecho', sets: 3, reps: 10, rest: 60 },
      { name: 'Extensión de tríceps en polea', sets: 3, reps: 12, rest: 45 },
    ],
    // Sesión C (Accesorios): agregar más volumen
    'Sesión C — Accesorios': [
      { name: 'Elevaciones laterales', sets: 3, reps: 15, rest: 45 },
      { name: 'Plancha', sets: 3, reps: null, target_duration_seconds: 45, rest: 45 },
    ],
  }

  // ---------------------------------------------------------------------------
  // 3. Construir nuevos ejercicios de sesión
  // ---------------------------------------------------------------------------
  console.log('\n📦 Preparando nuevos ejercicios...\n')

  const newSessionExercises = []
  let addedCount = 0

  for (const session of sessions) {
    const exercises_to_add = sessionExercises[session.name] || []

    if (exercises_to_add.length === 0) {
      console.log(`⚠️  ${session.name}: sin ejercicios adicionales definidos`)
      continue
    }

    // Obtener el máximo sort_order actual
    const { data: current, error: currentError } = await supabase
      .from('session_exercises')
      .select('sort_order')
      .eq('training_session_id', session.id)
      .order('sort_order', { ascending: false })
      .limit(1)

    if (currentError) {
      console.error(`❌ ${session.name}:`, currentError.message)
      continue
    }

    const maxSort = current.length > 0 ? current[0].sort_order : 0
    const existingIds = exBySession.get(session.id) || new Set()

    // Agregar solo los ejercicios que no estén ya en la sesión
    let sessionAddedCount = 0
    for (let i = 0; i < exercises_to_add.length; i++) {
      const exerciseSpec = exercises_to_add[i]
      const exerciseData = ex[exerciseSpec.name]

      if (!exerciseData) {
        console.log(`   ⚠️  Ejercicio no encontrado: "${exerciseSpec.name}"`)
        continue
      }

      if (existingIds.has(exerciseData.id)) {
        console.log(`   ⏭️  ${exerciseSpec.name}: ya existe en la sesión`)
        continue
      }

      const sortOrder = maxSort + i + 1
      newSessionExercises.push({
        training_session_id: session.id,
        exercise_id: exerciseData.id,
        sort_order: sortOrder,
        target_sets: exerciseSpec.sets,
        target_reps: exerciseSpec.reps,
        target_duration_seconds: exerciseSpec.target_duration_seconds || null,
        rest_seconds: exerciseSpec.rest,
      })

      sessionAddedCount++
      addedCount++
    }

    console.log(`✅ ${session.name}: +${sessionAddedCount} ejercicio(s)`)
  }

  // ---------------------------------------------------------------------------
  // 4. Insertar nuevos ejercicios
  // ---------------------------------------------------------------------------
  if (newSessionExercises.length === 0) {
    console.log('\n⚠️  No hay ejercicios nuevos que agregar')
    process.exit(0)
  }

  console.log(`\n📦 Insertando ${newSessionExercises.length} nuevos ejercicios...`)
  const { error: insertError } = await supabase
    .from('session_exercises')
    .insert(newSessionExercises)

  if (insertError) {
    console.error('❌ Error insertando:', insertError.message)
    process.exit(1)
  }

  // ---------------------------------------------------------------------------
  // 5. Resumen
  // ---------------------------------------------------------------------------
  console.log('\n✅ Ejercicios agregados exitosamente!')
  console.log(`   • Total agregado: ${addedCount} ejercicios`)
  console.log(`   • Sesiones actualizadas: ${sessions.length}`)
  console.log('\nEjemplos de adiciones:')
  console.log('   • Full Body A: +2 (Dominadas, Russian twist)')
  console.log('   • Push: +3 (Aperturas, Elevaciones frontales, Fondos)')
  console.log('   • Legs: +3 (Peso muerto rumano, Zancadas, Elevación de talones)')
}

main().catch((err) => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
