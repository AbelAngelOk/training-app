// Stage 1: reconcile the manifest's muscle_groups/equipment against the existing
// catalog. Synonyms reuse the existing row (avoids near-duplicate categories like
// "Barra Z (EZ)" next to "Barra EZ"); genuinely new categories get inserted.
require('dotenv').config({ path: 'c:/Users/abela/OneDrive/Desktop/Proyectos/training-app/.env' })
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const OUT_DIR = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad/gif-import'

// manifest label -> existing DB name_es (synonym reuse)
const MUSCLE_GROUP_SYNONYMS = {
  'Antebrazo': 'Antebrazos',
  'Hombros (Deltoides)': 'Hombros',
  'Abdomen / Core': 'Core',
}

const EQUIPMENT_SYNONYMS = {
  'Polea / Cable': 'Polea',
  'Fitball / Balón suizo': 'Pelota de estabilidad',
  'Barra Z (EZ)': 'Barra EZ',
  'Balón medicinal': 'Pelota medicinal',
}

// New categories to insert (name_es -> {name_en, description_es, description_en})
const NEW_MUSCLE_GROUPS = {
  'Calistenia / Cuerpo completo': {
    name_en: 'Calisthenics / Full Body',
    description_es: 'Ejercicios de peso corporal que trabajan múltiples grupos musculares a la vez, típicos de calistenia (dominadas avanzadas, planches, palancas).',
    description_en: 'Bodyweight exercises that work multiple muscle groups at once, typical of calisthenics (advanced pull-ups, planches, levers).',
  },
  'Funcional / Cuerpo completo': {
    name_en: 'Functional / Full Body',
    description_es: 'Movimientos funcionales que integran varios grupos musculares y patrones de movimiento simultáneamente (HIIT, entrenamiento funcional).',
    description_en: 'Functional movements that integrate several muscle groups and movement patterns simultaneously (HIIT, functional training).',
  },
  'Trapecio': {
    name_en: 'Trapezius',
    description_es: 'Músculo grande y plano que cubre la parte superior de la espalda y el cuello, encargado de elevar, retraer y rotar la escápula. Trabajado con encogimientos de hombros y remo.',
    description_en: 'Large, flat muscle covering the upper back and neck, responsible for elevating, retracting and rotating the scapula. Trained with shrugs and rows.',
  },
  'Estiramiento / Movilidad': {
    name_en: 'Stretching / Mobility',
    description_es: 'Ejercicios de flexibilidad y movilidad articular, sin carga externa significativa, orientados a la recuperación y el rango de movimiento.',
    description_en: 'Flexibility and joint mobility exercises, without significant external load, focused on recovery and range of motion.',
  },
}

const NEW_EQUIPMENT = {
  'Rueda abdominal': {
    name_en: 'Ab Wheel',
    description_es: 'Rueda con un eje central y agarres a los lados, usada para ejercicios de core en rodada (ab rollout).',
    description_en: 'Wheel with a central axle and side handles, used for core rollout exercises.',
  },
  'Banco': {
    name_en: 'Bench',
    description_es: 'Banco plano o ajustable usado como apoyo en ejercicios de fuerza (press, remo, extensiones).',
    description_en: 'Flat or adjustable bench used as support in strength exercises (press, rows, extensions).',
  },
  'TRX / Bandas de suspensión': {
    name_en: 'TRX / Suspension Trainer',
    description_es: 'Sistema de bandas de suspensión ancladas en un punto fijo, usa el peso corporal en ángulo para variar la resistencia.',
    description_en: 'Suspension band system anchored to a fixed point, uses body weight at an angle to vary resistance.',
  },
  'Pared': {
    name_en: 'Wall',
    description_es: 'Superficie vertical usada como apoyo o resistencia en ejercicios de calistenia y movilidad (sentadilla en pared, pino contra la pared).',
    description_en: 'Vertical surface used as support or resistance in calisthenics and mobility exercises (wall sit, wall handstand).',
  },
  'Cuerda': {
    name_en: 'Rope',
    description_es: 'Cuerda de tracción o battle rope, usada en ejercicios de polea o de acondicionamiento.',
    description_en: 'Pull rope or battle rope, used in cable exercises or conditioning work.',
  },
  'Disco / Peso libre': {
    name_en: 'Plate',
    description_es: 'Disco de peso libre, usado solo (sin barra) para ejercicios de core, hombros o carga adicional.',
    description_en: 'Free weight plate, used on its own (without a barbell) for core, shoulder or added-load exercises.',
  },
  'Landmine': {
    name_en: 'Landmine',
    description_es: 'Accesorio que fija un extremo de la barra al piso, permitiendo movimientos en arco con recorrido angular.',
    description_en: 'Attachment that anchors one end of a barbell to the floor, allowing arc-path movements with angular travel.',
  },
  'Barra de dominadas': {
    name_en: 'Pull-Up Bar',
    description_es: 'Barra fija elevada usada para dominadas y ejercicios de suspensión con el propio peso corporal.',
    description_en: 'Elevated fixed bar used for pull-ups and bodyweight suspension exercises.',
  },
  'Cajón pliométrico / Step': {
    name_en: 'Plyo Box / Step',
    description_es: 'Cajón o step de altura fija usado para saltos pliométricos y ejercicios de step-up.',
    description_en: 'Fixed-height box or step used for plyometric jumps and step-up exercises.',
  },
  'Paralelas / barras de fondos': {
    name_en: 'Parallel Bars / Dip Bars',
    description_es: 'Par de barras paralelas elevadas usadas para fondos de tríceps/pecho y ejercicios de calistenia.',
    description_en: 'Pair of elevated parallel bars used for triceps/chest dips and calisthenics exercises.',
  },
  'Toalla': {
    name_en: 'Towel',
    description_es: 'Toalla usada como agarre alternativo (grip) en ejercicios de tracción o estiramiento.',
    description_en: 'Towel used as an alternative grip in pulling or stretching exercises.',
  },
  'Bosu': {
    name_en: 'Bosu Ball',
    description_es: 'Media esfera inflable sobre base plana, usada para ejercicios de equilibrio e inestabilidad.',
    description_en: 'Inflatable half-ball on a flat base, used for balance and instability exercises.',
  },
  'Barra PVC': {
    name_en: 'PVC Pipe',
    description_es: 'Barra liviana de PVC sin peso, usada para practicar técnica y movilidad antes de cargar peso real.',
    description_en: 'Lightweight, unweighted PVC pipe used to practice technique and mobility before loading real weight.',
  },
  'Rodillo de espuma': {
    name_en: 'Foam Roller',
    description_es: 'Cilindro de espuma usado para automasaje y liberación miofascial antes o después del entrenamiento.',
    description_en: 'Foam cylinder used for self-massage and myofascial release before or after training.',
  },
}

async function main() {
  const { data: existingMg, error: mgErr } = await supabase.from('muscle_groups').select('id, name_es')
  if (mgErr) { console.error(mgErr); process.exit(1) }
  const { data: existingEq, error: eqErr } = await supabase.from('equipment').select('id, name_es')
  if (eqErr) { console.error(eqErr); process.exit(1) }

  const mgMap = Object.fromEntries(existingMg.map((r) => [r.name_es, r.id]))
  const eqMap = Object.fromEntries(existingEq.map((r) => [r.name_es, r.id]))

  const newMgRows = Object.entries(NEW_MUSCLE_GROUPS)
    .filter(([name_es]) => !mgMap[name_es])
    .map(([name_es, v]) => ({ name_es, ...v }))
  if (newMgRows.length > 0) {
    const { data: insertedMg, error: insMgErr } = await supabase
      .from('muscle_groups')
      .insert(newMgRows)
      .select('id, name_es')
    if (insMgErr) { console.error('insert muscle_groups error:', insMgErr); process.exit(1) }
    for (const r of insertedMg) mgMap[r.name_es] = r.id
  }
  console.log(`Insertados ${newMgRows.length} muscle_groups nuevos (idempotente)`)

  const newEqRows = Object.entries(NEW_EQUIPMENT)
    .filter(([name_es]) => !eqMap[name_es])
    .map(([name_es, v]) => ({ name_es, ...v }))
  if (newEqRows.length > 0) {
    const { data: insertedEq, error: insEqErr } = await supabase
      .from('equipment')
      .insert(newEqRows)
      .select('id, name_es')
    if (insEqErr) { console.error('insert equipment error:', insEqErr); process.exit(1) }
    for (const r of insertedEq) eqMap[r.name_es] = r.id
  }
  console.log(`Insertados ${newEqRows.length} equipment nuevos (idempotente)`)

  // Final resolver: manifest label -> DB id, applying synonym normalization
  function resolveMuscleGroupId(label) {
    const normalized = MUSCLE_GROUP_SYNONYMS[label] || label
    const id = mgMap[normalized]
    if (!id) throw new Error(`No se pudo resolver muscle_group: "${label}" (normalizado: "${normalized}")`)
    return id
  }
  function resolveEquipmentId(label) {
    const normalized = EQUIPMENT_SYNONYMS[label] || label
    const id = eqMap[normalized]
    if (!id) throw new Error(`No se pudo resolver equipment: "${label}" (normalizado: "${normalized}")`)
    return id
  }

  // sanity check against the full manifest label set
  const manifestMg = ['Abdomen / Core','Calistenia / Cuerpo completo','Funcional / Cuerpo completo','Bíceps','Antebrazo','Hombros (Deltoides)','Espalda','Trapecio','Piernas','Pecho','Tríceps','Glúteos','Pantorrillas','Estiramiento / Movilidad']
  const manifestEq = ['Rueda abdominal','Peso corporal','Banco','Máquina','Polea / Cable','Barra','Fitball / Balón suizo','TRX / Bandas de suspensión','Banda elástica','Pared','Mancuernas','Cuerda','Disco / Peso libre','Barra Z (EZ)','Máquina Smith','Landmine','Barra de dominadas','Balón medicinal','Cajón pliométrico / Step','Paralelas / barras de fondos','Kettlebell','Toalla','Bosu','Barra PVC','Rodillo de espuma']

  for (const l of manifestMg) resolveMuscleGroupId(l)
  for (const l of manifestEq) resolveEquipmentId(l)
  console.log('Todas las etiquetas del manifest resuelven a un id existente. OK.')

  fs.writeFileSync(
    `${OUT_DIR}/category-map.json`,
    JSON.stringify({
      muscleGroupSynonyms: MUSCLE_GROUP_SYNONYMS,
      equipmentSynonyms: EQUIPMENT_SYNONYMS,
      muscleGroupIdByName: mgMap,
      equipmentIdByName: eqMap,
    }, null, 2)
  )
  console.log('Escrito category-map.json')
}

main()
