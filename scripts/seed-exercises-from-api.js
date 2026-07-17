#!/usr/bin/env node
/**
 * Seed exercises from ExerciseDB API
 * Imports exercise data and stores it in Supabase with external_id reference
 */
require('dotenv').config()

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
const { createClient } = require('@supabase/supabase-js')

const EXERCISE_API_BASE = 'https://exercisedb.p.rapidapi.com'
const RAPID_API_KEY = process.env.RAPID_API_KEY
const RAPID_API_HOST = 'exercisedb.p.rapidapi.com'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

if (!RAPID_API_KEY) {
  console.error('Missing RAPID_API_KEY environment variable')
  console.log('Get a free API key at: https://rapidapi.com/justin-WFnsXH_haHLw/api/exercisedb')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const muscleGroupMap = {
  chest: 'Pecho',
  back: 'Espalda',
  legs: 'Piernas',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebrazos',
  abs: 'Core',
  glutes: 'Glúteos',
  calves: 'Pantorrillas',
  cardio: 'Cardio',
  stretching: 'Estiramiento',
}

const equipmentMap = {
  'assisted machine': 'Máquina',
  'bar': 'Barra',
  'barbell': 'Barra',
  'barbell rack': 'Barra',
  'body weight': 'Peso corporal',
  'bosu ball': 'BOSU Ball',
  'cable': 'Polea',
  'cable crossover': 'Polea',
  'court': null,
  'curl bar': 'Barra EZ',
  'dumbbell': 'Mancuernas',
  'ez barbell': 'Barra EZ',
  'foam roll': 'Foam Roller',
  'gymnastics': null,
  'incline bench': 'Banco inclinado',
  'kettlebell': 'Kettlebell',
  'landmine': 'Landmine',
  'leg press machine': 'Máquina',
  'machine': 'Máquina',
  'medicine ball': 'Pelota medicinal',
  'olympic barbell': 'Barra',
  'pull-up bar': 'Barra',
  'rest': null,
  'rope': 'Cuerda',
  'resonance board': null,
  'smith machine': 'Smith Machine',
  'stability ball': 'Pelota de estabilidad',
  'stationary bike': 'Bicicleta estática',
  'stretching strap': null,
  'tire': 'Llanta',
  'trap bar': 'Trap Bar',
  'upper back': null,
  'weighted': 'Pesas',
}

const difficultyMap = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  expert: 'advanced',
}

async function fetchFromAPI(url) {
  const response = await fetch(url, {
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': RAPID_API_HOST,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function getMuscleGroups() {
  console.log('Fetching all exercises to discover muscle groups...')
  const allExercises = []
  let offset = 0
  const limit = 100
  let hasMore = true

  while (hasMore) {
    const data = await fetchFromAPI(`${EXERCISE_API_BASE}/exercises?offset=${offset}&limit=${limit}`)
    if (!data || data.length === 0) {
      hasMore = false
      break
    }
    allExercises.push(...data)
    offset += limit
    console.log(`  Fetched ${allExercises.length} exercises so far...`)
  }

  console.log(`  Total exercises found: ${allExercises.length}`)
  const uniqueMuscles = [...new Set(allExercises.map((e) => e.target))].filter(Boolean)
  console.log(`  Unique muscle groups: ${uniqueMuscles.length}`)
  return uniqueMuscles
}

async function getExercisesForMuscle(muscle) {
  console.log(`Fetching exercises for muscle: ${muscle}`)
  const allExercises = []
  let offset = 0
  const limit = 100
  let hasMore = true

  while (hasMore) {
    const data = await fetchFromAPI(
      `${EXERCISE_API_BASE}/exercises/target/${muscle}?offset=${offset}&limit=${limit}`
    )
    if (!data || data.length === 0) {
      hasMore = false
      break
    }
    allExercises.push(...data)
    offset += limit
  }

  return allExercises
}

async function getOrCreateMuscleGroup(name, apiName) {
  const displayName = muscleGroupMap[apiName] || name

  let { data, error } = await supabase
    .from('muscle_groups')
    .select('id')
    .eq('name', displayName)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  if (!data) {
    const result = await supabase
      .from('muscle_groups')
      .insert({ name: displayName })
      .select()
      .single()

    if (result.error) throw result.error
    data = result.data
    console.log(`  Created muscle group: ${displayName}`)
  }

  return data
}

async function getOrCreateEquipment(apiEquipment) {
  if (!apiEquipment || !equipmentMap[apiEquipment.toLowerCase()]) {
    return null
  }

  const name = equipmentMap[apiEquipment.toLowerCase()]
  if (!name) return null

  let { data, error } = await supabase
    .from('equipment')
    .select('id')
    .eq('name', name)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  if (!data) {
    const result = await supabase
      .from('equipment')
      .insert({ name })
      .select()
      .single()

    if (result.error) throw result.error
    data = result.data
    console.log(`  Created equipment: ${name}`)
  }

  return data
}

async function exerciseExists(externalId) {
  const { data, error } = await supabase
    .from('exercises')
    .select('id')
    .eq('external_id', externalId)
    .single()

  if (error && error.code === 'PGRST116') return false
  if (error) throw error
  return !!data
}

async function seedExercises() {
  try {
    console.log('Starting exercise import from ExerciseDB API...\n')

    const muscles = await getMuscleGroups()
    console.log(`Found ${muscles.length} muscle groups\n`)

    let totalImported = 0
    let totalSkipped = 0

    for (const muscle of muscles) {
      const exercises = await getExercisesForMuscle(muscle)
      console.log(`  Found ${exercises.length} exercises for ${muscle}`)

      const muscleGroup = await getOrCreateMuscleGroup(muscle, muscle)

      for (const exercise of exercises) {
        try {
          // Check if already exists
          if (await exerciseExists(exercise.id)) {
            totalSkipped++
            continue
          }

          // Map difficulty
          const difficulty = difficultyMap[exercise.difficulty?.toLowerCase()] || 'beginner'

          // Get primary equipment (first one if array)
          const primaryEquipment = Array.isArray(exercise.equipment)
            ? exercise.equipment[0]
            : exercise.equipment

          const equipment = primaryEquipment ? await getOrCreateEquipment(primaryEquipment) : null

          // Parse instructions - join array into single text
          const instructions = Array.isArray(exercise.instructions)
            ? exercise.instructions.join('\n')
            : exercise.instructions || null

          // Parse tips - join array into single text
          const tips = Array.isArray(exercise.exerciseTips)
            ? exercise.exerciseTips.join('\n')
            : exercise.exerciseTips || null

          // Insert exercise
          const { error: insertError } = await supabase.from('exercises').insert({
            external_id: exercise.id,
            name: exercise.name,
            description: `Músculos: ${Array.isArray(exercise.bodyParts) ? exercise.bodyParts.join(', ') : exercise.bodyParts || muscle}`,
            instructions,
            tips,
            image_url: exercise.image || null,
            muscle_group_id: muscleGroup.id,
            equipment_id: equipment?.id || null,
            difficulty,
          })

          if (insertError) {
            console.error(`  Error inserting ${exercise.name}: ${insertError.message}`)
            totalSkipped++
          } else {
            totalImported++
            if (totalImported % 10 === 0) {
              console.log(`  ✓ Imported ${totalImported} exercises...`)
            }
          }
        } catch (err) {
          console.error(`  Error processing exercise ${exercise.name}: ${err.message}`)
          totalSkipped++
        }
      }

      console.log(`  ✓ Completed ${muscle}\n`)
    }

    console.log('\n========================================')
    console.log(`Import complete!`)
    console.log(`Total imported: ${totalImported}`)
    console.log(`Total skipped: ${totalSkipped}`)
    console.log('========================================')
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

seedExercises()
