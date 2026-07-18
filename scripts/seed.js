// @ts-nocheck
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

  console.log('🌱 Iniciando seed...\n')

  // ---------------------------------------------------------------------------
  // 1. MUSCLE GROUPS
  // ---------------------------------------------------------------------------
  console.log('📦 Insertando muscle_groups...')
  const { data: muscleGroups, error: mgError } = await supabase
    .from('muscle_groups')
    .insert([
      { name: 'Pecho' },
      { name: 'Espalda' },
      { name: 'Piernas' },
      { name: 'Hombros' },
      { name: 'Bíceps' },
      { name: 'Tríceps' },
      { name: 'Core' },
      { name: 'Glúteos' },
      { name: 'Pantorrillas' },
      { name: 'Antebrazos' },
    ])
    .select()

  if (mgError) { console.error('❌ muscle_groups:', mgError.message); process.exit(1) }
  console.log(`✅ ${muscleGroups.length} grupos musculares creados`)

  const mg = Object.fromEntries(muscleGroups.map((m) => [m.name, m.id]))

  // ---------------------------------------------------------------------------
  // 2. EQUIPMENT
  // ---------------------------------------------------------------------------
  console.log('\n📦 Insertando equipment...')
  const { data: equipmentList, error: eqError } = await supabase
    .from('equipment')
    .insert([
      { name: 'Barra' },
      { name: 'Mancuernas' },
      { name: 'Máquina' },
      { name: 'Peso corporal' },
      { name: 'Kettlebell' },
      { name: 'Banda elástica' },
      { name: 'Polea' },
      { name: 'Smith Machine' },
      { name: 'Barra EZ' },
    ])
    .select()

  if (eqError) { console.error('❌ equipment:', eqError.message); process.exit(1) }
  console.log(`✅ ${equipmentList.length} equipos creados`)

  const eq = Object.fromEntries(equipmentList.map((e) => [e.name, e.id]))

  // ---------------------------------------------------------------------------
  // 3. EXERCISES
  // ---------------------------------------------------------------------------
  console.log('\n📦 Insertando exercises...')

  const exercises = [
    // PECHO
    { name: 'Press de banca', description: 'Ejercicio compuesto para pecho con barra.', instructions: 'Acostado en el banco, baja la barra al pecho y empuja hacia arriba.', muscle_group_id: mg['Pecho'], equipment_id: eq['Barra'], difficulty: 'intermediate' },
    { name: 'Press inclinado con mancuernas', description: 'Press en banco inclinado para pecho superior.', instructions: 'En banco inclinado a 30-45°, empuja las mancuernas desde los hombros hacia arriba.', muscle_group_id: mg['Pecho'], equipment_id: eq['Mancuernas'], difficulty: 'intermediate' },
    { name: 'Aperturas con mancuernas', description: 'Aislamiento de pecho con movimiento de apertura.', instructions: 'En banco plano, abre los brazos en arco hasta sentir estiramiento en el pecho.', muscle_group_id: mg['Pecho'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Press de pecho en máquina', description: 'Press de pecho en máquina guiada.', instructions: 'Ajusta el asiento y empuja las manijas hacia adelante extendiendo los brazos.', muscle_group_id: mg['Pecho'], equipment_id: eq['Máquina'], difficulty: 'beginner' },
    { name: 'Flexiones', description: 'Ejercicio de peso corporal para pecho y tríceps.', instructions: 'En posición de plancha, baja el pecho al suelo y empuja hacia arriba.', muscle_group_id: mg['Pecho'], equipment_id: eq['Peso corporal'], difficulty: 'beginner' },
    { name: 'Fondos en paralelas', description: 'Ejercicio compuesto para pecho inferior y tríceps.', instructions: 'Apóyate en las barras paralelas, baja el cuerpo doblando los codos y empuja hacia arriba.', muscle_group_id: mg['Pecho'], equipment_id: eq['Peso corporal'], difficulty: 'intermediate' },
    { name: 'Crossover con polea', description: 'Aislamiento de pecho con polea.', instructions: 'De pie entre dos poleas altas, cruza los brazos frente al pecho.', muscle_group_id: mg['Pecho'], equipment_id: eq['Polea'], difficulty: 'beginner' },

    // ESPALDA
    { name: 'Dominadas', description: 'Ejercicio compuesto para espalda con peso corporal.', instructions: 'Colgado de la barra, jala tu cuerpo hacia arriba hasta que el mentón supere la barra.', muscle_group_id: mg['Espalda'], equipment_id: eq['Peso corporal'], difficulty: 'intermediate' },
    { name: 'Jalón al pecho', description: 'Ejercicio de jale para espalda en polea alta.', instructions: 'Sentado, jala la barra hacia el pecho manteniendo la espalda recta.', muscle_group_id: mg['Espalda'], equipment_id: eq['Polea'], difficulty: 'beginner' },
    { name: 'Remo con barra', description: 'Ejercicio compuesto de jale horizontal con barra.', instructions: 'Con torso inclinado, jala la barra hacia el abdomen.', muscle_group_id: mg['Espalda'], equipment_id: eq['Barra'], difficulty: 'intermediate' },
    { name: 'Remo con mancuerna', description: 'Remo unilateral con mancuerna.', instructions: 'Apoyado en el banco con una mano y rodilla, jala la mancuerna hacia la cadera.', muscle_group_id: mg['Espalda'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Peso muerto', description: 'Ejercicio compuesto fundamental para toda la cadena posterior.', instructions: 'Con pies al ancho de hombros, levanta la barra desde el suelo extendiendo caderas y rodillas.', muscle_group_id: mg['Espalda'], equipment_id: eq['Barra'], difficulty: 'advanced' },
    { name: 'Remo en polea baja', description: 'Remo sentado en polea baja para espalda media.', instructions: 'Sentado, jala el cable hacia el abdomen manteniendo la espalda recta.', muscle_group_id: mg['Espalda'], equipment_id: eq['Polea'], difficulty: 'beginner' },
    { name: 'Pullover con mancuerna', description: 'Ejercicio para espalda y pecho con mancuerna.', instructions: 'Acostado en el banco, lleva la mancuerna por detrás de la cabeza con brazos semirrectos.', muscle_group_id: mg['Espalda'], equipment_id: eq['Mancuernas'], difficulty: 'intermediate' },

    // PIERNAS
    { name: 'Sentadilla con barra', description: 'El ejercicio rey para piernas.', instructions: 'Con barra en los trapecios, baja hasta que los muslos queden paralelos al suelo.', muscle_group_id: mg['Piernas'], equipment_id: eq['Barra'], difficulty: 'advanced' },
    { name: 'Prensa de piernas', description: 'Ejercicio para cuádriceps en máquina.', instructions: 'Sentado en la prensa, empuja la plataforma extendiendo las piernas sin bloquear rodillas.', muscle_group_id: mg['Piernas'], equipment_id: eq['Máquina'], difficulty: 'beginner' },
    { name: 'Extensiones de cuádriceps', description: 'Aislamiento de cuádriceps en máquina.', instructions: 'Sentado en la máquina, extiende las piernas hacia arriba de forma controlada.', muscle_group_id: mg['Piernas'], equipment_id: eq['Máquina'], difficulty: 'beginner' },
    { name: 'Curl femoral acostado', description: 'Aislamiento de isquiotibiales en máquina.', instructions: 'Acostado boca abajo, lleva los talones hacia los glúteos de forma controlada.', muscle_group_id: mg['Piernas'], equipment_id: eq['Máquina'], difficulty: 'beginner' },
    { name: 'Zancadas con mancuernas', description: 'Ejercicio unilateral para piernas y glúteos.', instructions: 'Da un paso adelante y baja la rodilla trasera casi hasta el suelo, alterna piernas.', muscle_group_id: mg['Piernas'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Sentadilla goblet', description: 'Sentadilla frontal con kettlebell.', instructions: 'Sostén el kettlebell frente al pecho y baja en sentadilla profunda.', muscle_group_id: mg['Piernas'], equipment_id: eq['Kettlebell'], difficulty: 'beginner' },
    { name: 'Peso muerto rumano', description: 'Variante del peso muerto para isquiotibiales y glúteos.', instructions: 'Con piernas casi extendidas, inclina el torso bajando la barra por las piernas.', muscle_group_id: mg['Piernas'], equipment_id: eq['Barra'], difficulty: 'intermediate' },

    // HOMBROS
    { name: 'Press militar con barra', description: 'Press vertical con barra para hombros.', instructions: 'De pie o sentado, empuja la barra desde los hombros hacia arriba.', muscle_group_id: mg['Hombros'], equipment_id: eq['Barra'], difficulty: 'intermediate' },
    { name: 'Press con mancuernas', description: 'Press vertical con mancuernas para hombros.', instructions: 'Sentado, empuja las mancuernas desde los hombros hacia arriba alternando o simultáneo.', muscle_group_id: mg['Hombros'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Elevaciones laterales', description: 'Aislamiento del deltoides lateral.', instructions: 'De pie, levanta las mancuernas hacia los lados hasta la altura de los hombros.', muscle_group_id: mg['Hombros'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Elevaciones frontales', description: 'Aislamiento del deltoides frontal.', instructions: 'De pie, levanta las mancuernas hacia adelante hasta la altura de los hombros.', muscle_group_id: mg['Hombros'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Pájaros', description: 'Ejercicio para deltoides posterior.', instructions: 'Inclinado hacia adelante, abre los brazos hacia los lados manteniendo codos levemente doblados.', muscle_group_id: mg['Hombros'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Face pulls', description: 'Ejercicio para deltoides posterior y manguito rotador.', instructions: 'Con polea alta, jala la cuerda hacia tu cara con codos elevados.', muscle_group_id: mg['Hombros'], equipment_id: eq['Polea'], difficulty: 'beginner' },

    // BÍCEPS
    { name: 'Curl con barra', description: 'Ejercicio básico de bíceps con barra.', instructions: 'De pie, dobla los codos levantando la barra hasta los hombros.', muscle_group_id: mg['Bíceps'], equipment_id: eq['Barra'], difficulty: 'beginner' },
    { name: 'Curl con mancuernas', description: 'Curl de bíceps con mancuernas alternado.', instructions: 'De pie o sentado, levanta las mancuernas doblando los codos alternando brazos.', muscle_group_id: mg['Bíceps'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Curl martillo', description: 'Variante del curl que trabaja bíceps y braquial.', instructions: 'Con agarre neutro (pulgares arriba), levanta las mancuernas doblando los codos.', muscle_group_id: mg['Bíceps'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Curl en predicador', description: 'Curl de bíceps en banco predicador para mayor aislamiento.', instructions: 'Apoya los brazos en el banco predicador y levanta la barra EZ doblando los codos.', muscle_group_id: mg['Bíceps'], equipment_id: eq['Barra EZ'], difficulty: 'beginner' },
    { name: 'Curl en polea baja', description: 'Curl de bíceps en polea para tensión constante.', instructions: 'De pie frente a la polea baja, dobla los codos levantando el cable.', muscle_group_id: mg['Bíceps'], equipment_id: eq['Polea'], difficulty: 'beginner' },

    // TRÍCEPS
    { name: 'Extensión de tríceps en polea', description: 'Aislamiento de tríceps con polea alta.', instructions: 'De pie frente a la polea alta, extiende los codos empujando el cable hacia abajo.', muscle_group_id: mg['Tríceps'], equipment_id: eq['Polea'], difficulty: 'beginner' },
    { name: 'Press francés', description: 'Ejercicio de extensión de tríceps con barra EZ.', instructions: 'Acostado, baja la barra EZ hacia la frente doblando los codos y extiende.', muscle_group_id: mg['Tríceps'], equipment_id: eq['Barra EZ'], difficulty: 'intermediate' },
    { name: 'Extensión sobre cabeza con mancuerna', description: 'Extensión de tríceps sobre la cabeza.', instructions: 'Sostén una mancuerna sobre la cabeza con ambas manos y baja doblando los codos.', muscle_group_id: mg['Tríceps'], equipment_id: eq['Mancuernas'], difficulty: 'beginner' },
    { name: 'Press cerrado', description: 'Press de banca con agarre cerrado para tríceps.', instructions: 'Como el press de banca pero con agarre estrecho para enfatizar los tríceps.', muscle_group_id: mg['Tríceps'], equipment_id: eq['Barra'], difficulty: 'intermediate' },

    // CORE
    { name: 'Plancha', description: 'Ejercicio isométrico de core.', instructions: 'Apóyate en los antebrazos y pies manteniendo el cuerpo recto como una tabla.', muscle_group_id: mg['Core'], equipment_id: eq['Peso corporal'], difficulty: 'beginner' },
    { name: 'Crunch', description: 'Ejercicio básico de abdominales.', instructions: 'Acostado boca arriba, levanta los hombros del suelo contrayendo el abdomen.', muscle_group_id: mg['Core'], equipment_id: eq['Peso corporal'], difficulty: 'beginner' },
    { name: 'Elevación de piernas', description: 'Ejercicio para abdomen inferior.', instructions: 'Acostado boca arriba, levanta las piernas extendidas hasta 90° de forma controlada.', muscle_group_id: mg['Core'], equipment_id: eq['Peso corporal'], difficulty: 'intermediate' },
    { name: 'Russian twist', description: 'Rotación de torso para oblicuos.', instructions: 'Sentado con torso inclinado y pies elevados, rota el torso de lado a lado.', muscle_group_id: mg['Core'], equipment_id: eq['Peso corporal'], difficulty: 'beginner' },

    // GLÚTEOS
    { name: 'Hip thrust con barra', description: 'El mejor ejercicio para glúteos.', instructions: 'Con espalda apoyada en el banco y barra en las caderas, empuja las caderas hacia arriba.', muscle_group_id: mg['Glúteos'], equipment_id: eq['Barra'], difficulty: 'intermediate' },
    { name: 'Patada trasera en polea', description: 'Aislamiento de glúteos en polea.', instructions: 'De pie frente a la polea baja, empuja la pierna hacia atrás extendiendo la cadera.', muscle_group_id: mg['Glúteos'], equipment_id: eq['Polea'], difficulty: 'beginner' },

    // PANTORRILLAS
    { name: 'Elevación de talones de pie', description: 'Ejercicio para gemelos de pie.', instructions: 'De pie, elévate sobre las puntas de los pies y baja lentamente.', muscle_group_id: mg['Pantorrillas'], equipment_id: eq['Peso corporal'], difficulty: 'beginner' },
    { name: 'Elevación de talones sentado', description: 'Ejercicio para sóleo en máquina.', instructions: 'Sentado en la máquina con el peso en las rodillas, eleva los talones.', muscle_group_id: mg['Pantorrillas'], equipment_id: eq['Máquina'], difficulty: 'beginner' },
  ]

  const { data: exercisesData, error: exError } = await supabase
    .from('exercises')
    .insert(exercises)
    .select()

  if (exError) { console.error('❌ exercises:', exError.message); process.exit(1) }
  console.log(`✅ ${exercisesData.length} ejercicios creados`)

  // ---------------------------------------------------------------------------
  // 4. ACHIEVEMENTS
  // ---------------------------------------------------------------------------
  console.log('\n📦 Insertando achievements...')
  const { data: achievementsData, error: achError } = await supabase
    .from('achievements')
    .insert([
      { code: 'FIRST_WORKOUT',      name: 'Primer Entrenamiento',     description: 'Completaste tu primer entrenamiento. ¡El viaje comienza!' },
      { code: 'TEN_WORKOUTS',       name: '10 Entrenamientos',         description: 'Completaste 10 entrenamientos. ¡El hábito se forma!' },
      { code: 'FIFTY_WORKOUTS',     name: '50 Entrenamientos',         description: 'Completaste 50 entrenamientos. ¡Eso es dedicación!' },
      { code: 'HUNDRED_WORKOUTS',   name: '100 Entrenamientos',        description: 'Completaste 100 entrenamientos. ¡Eres imparable!' },
      { code: 'WEEK_STREAK',        name: 'Racha de 7 días',           description: 'Entrenaste 7 días consecutivos. ¡La consistencia es clave!' },
      { code: 'MONTH_STREAK',       name: 'Racha de 30 días',          description: 'Entrenaste 30 días consecutivos. ¡Eres una máquina!' },
      { code: 'HUNDRED_HOURS',      name: '100 Horas de entrenamiento',description: 'Acumulaste 100 horas de entrenamiento total.' },
      { code: 'TEN_THOUSAND_KG',    name: '10,000 kg levantados',      description: 'Levantaste un total de 10,000 kg. ¡Fuerza brutal!' },
      { code: 'HUNDRED_THOUSAND_KG',name: '100,000 kg levantados',     description: 'Levantaste un total de 100,000 kg. ¡Leyenda!' },
      { code: 'MARATHON',           name: 'Maratonista',               description: 'Recorriste más de 42 km en total.' },
    ])
    .select()

  if (achError) { console.error('❌ achievements:', achError.message); process.exit(1) }
  console.log(`✅ ${achievementsData.length} logros creados`)

  // ---------------------------------------------------------------------------
  // 5. SUBSCRIPTION PLANS
  // ---------------------------------------------------------------------------
  console.log('\n📦 Insertando subscription_plans...')
  const { data: plansData, error: plansError } = await supabase
    .from('subscription_plans')
    .insert([
      {
        code: 'premium_monthly',
        name: 'Premium Mensual',
        duration_months: 1,
        price: 9.99,
        active: true,
      },
      {
        code: 'premium_yearly',
        name: 'Premium Anual',
        duration_months: 12,
        price: 79.99,
        active: true,
      },
    ])
    .select()

  if (plansError) { console.error('❌ subscription_plans:', plansError.message); process.exit(1) }
  console.log(`✅ ${plansData.length} planes de suscripción creados`)

  // ---------------------------------------------------------------------------
  // RESUMEN
  // ---------------------------------------------------------------------------
  console.log('\n✅ Seed completado exitosamente!')
  console.log(`   • ${muscleGroups.length} grupos musculares`)
  console.log(`   • ${equipmentList.length} equipos`)
  console.log(`   • ${exercisesData.length} ejercicios`)
  console.log(`   • ${achievementsData.length} logros`)
  console.log(`   • ${plansData.length} planes de suscripción`)
}

main().catch((err) => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
