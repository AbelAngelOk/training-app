// @ts-nocheck
async function main() {
  const { createClient } = await import('@supabase/supabase-js')

  const supabase = createClient(
    'https://ahmgdqufbxsteklkbwer.supabase.co',
    'REDACTED_ROTATE_THIS_KEY'
  )

  console.log('🌱 Iniciando seed de programas oficiales...\n')

  // ---------------------------------------------------------------------------
  // 1. FETCH EXERCISES (already seeded)
  // ---------------------------------------------------------------------------
  console.log('📦 Cargando ejercicios...')
  const { data: exercises, error: exError } = await supabase
    .from('exercises')
    .select('id, name')

  if (exError) { console.error('❌ exercises:', exError.message); process.exit(1) }
  console.log(`✅ ${exercises.length} ejercicios encontrados`)

  const ex = Object.fromEntries(exercises.map((e) => [e.name, e.id]))

  const requireEx = (name) => {
    const id = ex[name]
    if (!id) { console.error(`❌ Ejercicio no encontrado: "${name}". Corré seed.js primero.`); process.exit(1) }
    return id
  }

  // ---------------------------------------------------------------------------
  // 2. WORKOUT PROGRAMS
  // ---------------------------------------------------------------------------
  console.log('\n📦 Insertando programas...')
  const { data: programs, error: progError } = await supabase
    .from('workout_programs')
    .insert([
      {
        name: 'Principiante 3 Días',
        description: 'Programa de cuerpo completo para principiantes. Tres sesiones semanales enfocadas en los movimientos fundamentales del gimnasio.',
        type: 'official',
        active: true,
      },
      {
        name: 'Hipertrofia 4 Días',
        description: 'División Push / Pull / Piernas / Upper para maximizar la hipertrofia muscular. Cuatro sesiones semanales con volumen e intensidad progresivos.',
        type: 'official',
        active: true,
      },
      {
        name: 'Fuerza 5×5',
        description: 'Programa clásico de fuerza basado en los 5 movimientos fundamentales. Tres sesiones semanales con enfoque en ganancia de fuerza pura.',
        type: 'official',
        active: true,
      },
    ])
    .select()

  if (progError) { console.error('❌ workout_programs:', progError.message); process.exit(1) }
  const [progBeginner, progHypertrophy, progStrength] = programs
  console.log(`✅ Programa "${progBeginner.name}" creado (${progBeginner.id})`)
  console.log(`✅ Programa "${progHypertrophy.name}" creado (${progHypertrophy.id})`)
  console.log(`✅ Programa "${progStrength.name}" creado (${progStrength.id})`)

  // ---------------------------------------------------------------------------
  // 3. TRAINING SESSIONS
  // ---------------------------------------------------------------------------
  console.log('\n📦 Insertando sesiones...')

  const sessionsData = [
    // Principiante 3 Días
    { name: 'Full Body A', description: 'Primer sesión de cuerpo completo. Enfoque en sentadilla y press de banca.', type: 'official', estimated_duration_minutes: 50 },
    { name: 'Full Body B', description: 'Segunda sesión de cuerpo completo. Enfoque en prensa y trabajo de empuje superior.', type: 'official', estimated_duration_minutes: 50 },
    { name: 'Full Body C', description: 'Tercera sesión de cuerpo completo. Enfoque en peso muerto y fondos.', type: 'official', estimated_duration_minutes: 50 },
    // Hipertrofia 4 Días
    { name: 'Push — Empuje', description: 'Pecho, hombros y tríceps. Movimientos de empuje horizontal y vertical.', type: 'official', estimated_duration_minutes: 65 },
    { name: 'Pull — Jale', description: 'Espalda y bíceps. Movimientos de jale vertical y horizontal.', type: 'official', estimated_duration_minutes: 65 },
    { name: 'Legs — Piernas', description: 'Cuádriceps, isquiotibiales y glúteos. Sentadilla y variantes de bisagra de cadera.', type: 'official', estimated_duration_minutes: 70 },
    { name: 'Upper — Torso', description: 'Sesión de torso completo. Mezcla de empuje y jale para volumen adicional.', type: 'official', estimated_duration_minutes: 60 },
    // Fuerza 5x5 - 3 Días
    { name: 'Sesión A — Sentadilla, Banca, Remo', description: 'Sesión de fuerza con sentadilla, press de banca y remo. Enfoque en fuerza pura con series de 5 reps.', type: 'official', estimated_duration_minutes: 55 },
    { name: 'Sesión B — Sentadilla, Press, Peso Muerto', description: 'Segunda sesión con sentadilla, press militar y peso muerto. Construcción de fuerza en los movimientos fundamentales.', type: 'official', estimated_duration_minutes: 55 },
    { name: 'Sesión C — Accesorios', description: 'Sesión de accesorios y volumen complementario. Fortalecimiento de grupos musculares débiles.', type: 'official', estimated_duration_minutes: 45 },
  ]

  const { data: sessions, error: sessError } = await supabase
    .from('training_sessions')
    .insert(sessionsData)
    .select()

  if (sessError) { console.error('❌ training_sessions:', sessError.message); process.exit(1) }
  console.log(`✅ ${sessions.length} sesiones creadas`)

  const [sessFullBodyA, sessFullBodyB, sessFullBodyC, sessPush, sessPull, sessLegs, sessUpper, sess5x5A, sess5x5B, sess5x5C] = sessions

  // ---------------------------------------------------------------------------
  // 4. PROGRAM DAYS
  // ---------------------------------------------------------------------------
  console.log('\n📦 Insertando program_days...')

  const programDays = [
    // Principiante 3 días: L/M/V
    { workout_program_id: progBeginner.id, weekday: 'monday',    training_session_id: sessFullBodyA.id },
    { workout_program_id: progBeginner.id, weekday: 'wednesday', training_session_id: sessFullBodyB.id },
    { workout_program_id: progBeginner.id, weekday: 'friday',    training_session_id: sessFullBodyC.id },
    // Hipertrofia 4 días: L/Ma/Ju/Sa
    { workout_program_id: progHypertrophy.id, weekday: 'monday',    training_session_id: sessPush.id },
    { workout_program_id: progHypertrophy.id, weekday: 'tuesday',   training_session_id: sessPull.id },
    { workout_program_id: progHypertrophy.id, weekday: 'thursday',  training_session_id: sessLegs.id },
    { workout_program_id: progHypertrophy.id, weekday: 'saturday',  training_session_id: sessUpper.id },
    // Fuerza 5x5 - 3 días: L/X/V
    { workout_program_id: progStrength.id, weekday: 'monday',    training_session_id: sess5x5A.id },
    { workout_program_id: progStrength.id, weekday: 'wednesday', training_session_id: sess5x5B.id },
    { workout_program_id: progStrength.id, weekday: 'friday',    training_session_id: sess5x5C.id },
  ]

  const { error: daysError } = await supabase.from('program_days').insert(programDays)
  if (daysError) { console.error('❌ program_days:', daysError.message); process.exit(1) }
  console.log(`✅ ${programDays.length} días de programa creados`)

  // ---------------------------------------------------------------------------
  // 5. SESSION EXERCISES
  // ---------------------------------------------------------------------------
  console.log('\n📦 Insertando session_exercises...')

  const sessionExercises = [
    // --- Full Body A ---
    { training_session_id: sessFullBodyA.id, exercise_id: requireEx('Sentadilla con barra'),         sort_order: 1, target_sets: 3, target_reps: 10, rest_seconds: 90 },
    { training_session_id: sessFullBodyA.id, exercise_id: requireEx('Press de banca'),               sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 90 },
    { training_session_id: sessFullBodyA.id, exercise_id: requireEx('Remo con mancuerna'),           sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 60 },
    { training_session_id: sessFullBodyA.id, exercise_id: requireEx('Press con mancuernas'),         sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 60 },
    { training_session_id: sessFullBodyA.id, exercise_id: requireEx('Plancha'),                      sort_order: 5, target_sets: 3, target_reps: null, target_duration_seconds: 30, rest_seconds: 45 },

    // --- Full Body B ---
    { training_session_id: sessFullBodyB.id, exercise_id: requireEx('Prensa de piernas'),            sort_order: 1, target_sets: 3, target_reps: 12, rest_seconds: 90 },
    { training_session_id: sessFullBodyB.id, exercise_id: requireEx('Press inclinado con mancuernas'), sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 90 },
    { training_session_id: sessFullBodyB.id, exercise_id: requireEx('Jalón al pecho'),               sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 60 },
    { training_session_id: sessFullBodyB.id, exercise_id: requireEx('Elevaciones laterales'),        sort_order: 4, target_sets: 3, target_reps: 15, rest_seconds: 45 },
    { training_session_id: sessFullBodyB.id, exercise_id: requireEx('Crunch'),                       sort_order: 5, target_sets: 3, target_reps: 20, rest_seconds: 30 },

    // --- Full Body C ---
    { training_session_id: sessFullBodyC.id, exercise_id: requireEx('Peso muerto'),                  sort_order: 1, target_sets: 3, target_reps: 8, rest_seconds: 120 },
    { training_session_id: sessFullBodyC.id, exercise_id: requireEx('Zancadas con mancuernas'),      sort_order: 2, target_sets: 3, target_reps: 12, rest_seconds: 60 },
    { training_session_id: sessFullBodyC.id, exercise_id: requireEx('Fondos en paralelas'),          sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 75 },
    { training_session_id: sessFullBodyC.id, exercise_id: requireEx('Curl con mancuernas'),          sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 45 },
    { training_session_id: sessFullBodyC.id, exercise_id: requireEx('Extensión de tríceps en polea'), sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 45 },

    // --- Push ---
    { training_session_id: sessPush.id, exercise_id: requireEx('Press de banca'),               sort_order: 1, target_sets: 4, target_reps: 8,  rest_seconds: 120 },
    { training_session_id: sessPush.id, exercise_id: requireEx('Press inclinado con mancuernas'), sort_order: 2, target_sets: 3, target_reps: 10, rest_seconds: 90 },
    { training_session_id: sessPush.id, exercise_id: requireEx('Press militar con barra'),       sort_order: 3, target_sets: 3, target_reps: 8,  rest_seconds: 90 },
    { training_session_id: sessPush.id, exercise_id: requireEx('Elevaciones laterales'),         sort_order: 4, target_sets: 4, target_reps: 15, rest_seconds: 45 },
    { training_session_id: sessPush.id, exercise_id: requireEx('Extensión de tríceps en polea'), sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 45 },
    { training_session_id: sessPush.id, exercise_id: requireEx('Press cerrado'),                 sort_order: 6, target_sets: 3, target_reps: 10, rest_seconds: 75 },

    // --- Pull ---
    { training_session_id: sessPull.id, exercise_id: requireEx('Dominadas'),            sort_order: 1, target_sets: 4, target_reps: 8,  rest_seconds: 120 },
    { training_session_id: sessPull.id, exercise_id: requireEx('Remo con barra'),       sort_order: 2, target_sets: 4, target_reps: 8,  rest_seconds: 90 },
    { training_session_id: sessPull.id, exercise_id: requireEx('Jalón al pecho'),       sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 75 },
    { training_session_id: sessPull.id, exercise_id: requireEx('Remo en polea baja'),   sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 60 },
    { training_session_id: sessPull.id, exercise_id: requireEx('Curl con mancuernas'),  sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 45 },
    { training_session_id: sessPull.id, exercise_id: requireEx('Curl martillo'),        sort_order: 6, target_sets: 3, target_reps: 12, rest_seconds: 45 },

    // --- Legs ---
    { training_session_id: sessLegs.id, exercise_id: requireEx('Sentadilla con barra'),    sort_order: 1, target_sets: 4, target_reps: 8,  rest_seconds: 120 },
    { training_session_id: sessLegs.id, exercise_id: requireEx('Prensa de piernas'),       sort_order: 2, target_sets: 3, target_reps: 12, rest_seconds: 90 },
    { training_session_id: sessLegs.id, exercise_id: requireEx('Extensiones de cuádriceps'), sort_order: 3, target_sets: 3, target_reps: 15, rest_seconds: 60 },
    { training_session_id: sessLegs.id, exercise_id: requireEx('Curl femoral acostado'),   sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 60 },
    { training_session_id: sessLegs.id, exercise_id: requireEx('Hip thrust con barra'),    sort_order: 5, target_sets: 4, target_reps: 10, rest_seconds: 90 },
    { training_session_id: sessLegs.id, exercise_id: requireEx('Elevación de talones de pie'), sort_order: 6, target_sets: 4, target_reps: 20, rest_seconds: 30 },

    // --- Upper ---
    { training_session_id: sessUpper.id, exercise_id: requireEx('Press de banca'),        sort_order: 1, target_sets: 4, target_reps: 8,  rest_seconds: 90 },
    { training_session_id: sessUpper.id, exercise_id: requireEx('Remo con mancuerna'),    sort_order: 2, target_sets: 4, target_reps: 10, rest_seconds: 75 },
    { training_session_id: sessUpper.id, exercise_id: requireEx('Press militar con barra'), sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 75 },
    { training_session_id: sessUpper.id, exercise_id: requireEx('Curl en predicador'),    sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 45 },
    { training_session_id: sessUpper.id, exercise_id: requireEx('Press francés'),         sort_order: 5, target_sets: 3, target_reps: 12, rest_seconds: 45 },

    // --- Sesión A (5x5) ---
    { training_session_id: sess5x5A.id, exercise_id: requireEx('Sentadilla con barra'), sort_order: 1, target_sets: 5, target_reps: 5, rest_seconds: 180 },
    { training_session_id: sess5x5A.id, exercise_id: requireEx('Press de banca'),        sort_order: 2, target_sets: 5, target_reps: 5, rest_seconds: 180 },
    { training_session_id: sess5x5A.id, exercise_id: requireEx('Remo con barra'),        sort_order: 3, target_sets: 5, target_reps: 5, rest_seconds: 180 },
    { training_session_id: sess5x5A.id, exercise_id: requireEx('Elevación de talones de pie'), sort_order: 4, target_sets: 3, target_reps: 10, rest_seconds: 60 },

    // --- Sesión B (5x5) ---
    { training_session_id: sess5x5B.id, exercise_id: requireEx('Sentadilla con barra'),   sort_order: 1, target_sets: 5, target_reps: 5, rest_seconds: 180 },
    { training_session_id: sess5x5B.id, exercise_id: requireEx('Press militar con barra'), sort_order: 2, target_sets: 5, target_reps: 5, rest_seconds: 180 },
    { training_session_id: sess5x5B.id, exercise_id: requireEx('Peso muerto'),             sort_order: 3, target_sets: 1, target_reps: 5, rest_seconds: 300 },
    { training_session_id: sess5x5B.id, exercise_id: requireEx('Elevación de talones de pie'), sort_order: 4, target_sets: 3, target_reps: 10, rest_seconds: 60 },

    // --- Sesión C (Accesorios) ---
    { training_session_id: sess5x5C.id, exercise_id: requireEx('Curl con mancuernas'),     sort_order: 1, target_sets: 3, target_reps: 8, rest_seconds: 60 },
    { training_session_id: sess5x5C.id, exercise_id: requireEx('Press inclinado con mancuernas'), sort_order: 2, target_sets: 3, target_reps: 8, rest_seconds: 75 },
    { training_session_id: sess5x5C.id, exercise_id: requireEx('Remo en polea baja'),       sort_order: 3, target_sets: 3, target_reps: 10, rest_seconds: 60 },
    { training_session_id: sess5x5C.id, exercise_id: requireEx('Extensión de tríceps en polea'), sort_order: 4, target_sets: 3, target_reps: 12, rest_seconds: 45 },
    { training_session_id: sess5x5C.id, exercise_id: requireEx('Curl martillo'),            sort_order: 5, target_sets: 3, target_reps: 8, rest_seconds: 60 },
  ]

  const { error: seError } = await supabase.from('session_exercises').insert(sessionExercises)
  if (seError) { console.error('❌ session_exercises:', seError.message); process.exit(1) }
  console.log(`✅ ${sessionExercises.length} ejercicios por sesión creados`)

  // ---------------------------------------------------------------------------
  // RESUMEN
  // ---------------------------------------------------------------------------
  console.log('\n✅ Programas oficiales creados exitosamente!')
  console.log('\n📋 Principiante 3 Días:')
  console.log('   • Lunes:     Full Body A (5 ejercicios, 50 min)')
  console.log('   • Miércoles: Full Body B (5 ejercicios, 50 min)')
  console.log('   • Viernes:   Full Body C (5 ejercicios, 50 min)')
  console.log('\n📋 Hipertrofia 4 Días:')
  console.log('   • Lunes:     Push — Empuje (6 ejercicios, 65 min)')
  console.log('   • Martes:    Pull — Jale  (6 ejercicios, 65 min)')
  console.log('   • Jueves:    Legs — Piernas (6 ejercicios, 70 min)')
  console.log('   • Sábado:    Upper — Torso  (5 ejercicios, 60 min)')
  console.log('\n📋 Fuerza 5×5 - 3 Días:')
  console.log('   • Lunes:     Sesión A (4 ejercicios, 55 min)')
  console.log('   • Miércoles: Sesión B (4 ejercicios, 55 min)')
  console.log('   • Viernes:   Sesión C (5 ejercicios, 45 min)')
}

main().catch((err) => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
