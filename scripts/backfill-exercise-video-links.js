#!/usr/bin/env node
/**
 * Backfill exercise video links for Spanish exercise names
 * Maps the 37 exercises currently used in sessions to ExerciseDB by searching for close matches
 * Updates existing exercises with external_id instead of creating new rows
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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Spanish-to-English exercise name mappings for the 37 exercises currently in sessions
const exerciseTranslations = {
  'Aperturas con mancuernas': 'dumbbell flye',
  'Crunch': 'crunches',
  'Curl con mancuernas': 'dumbbell curl',
  'Curl en polea baja': 'cable curl',
  'Curl en predicador': 'barbell preacher curl',
  'Curl femoral acostado': 'lying leg curl',
  'Curl martillo': 'hammer curl',
  'Dominadas': 'pull-up',
  'Elevaciones frontales': 'dumbbell front raise',
  'Elevaciones laterales': 'dumbbell lateral raise',
  'Elevación de piernas': 'leg raise',
  'Elevación de talones de pie': 'standing calf raise',
  'Elevación de talones sentado': 'seated calf raise',
  'Extensiones de cuádriceps': 'leg extension',
  'Extensión de tríceps en polea': 'triceps pushdown',
  'Flexiones': 'push-up',
  'Fondos en paralelas': 'dips',
  'Hip thrust con barra': 'barbell hip thrust',
  'Jalón al pecho': 'lat-pulldown',
  'Peso muerto': 'deadlift',
  'Peso muerto rumano': 'romanian deadlift',
  'Plancha': 'plank',
  'Prensa de piernas': 'leg press',
  'Press cerrado': 'close-grip barbell bench press',
  'Press con mancuernas': 'dumbbell bench press',
  'Press de banca': 'barbell bench press',
  'Press francés': 'barbell french press',
  'Press inclinado con mancuernas': 'dumbbell incline bench press',
  'Press militar con barra': 'barbell shoulder press',
  'Pullover con mancuerna': 'dumbbell pullover',
  'Pájaros': 'cable crossover',
  'Remo con barra': 'barbell bent over row',
  'Remo con mancuerna': 'dumbbell row',
  'Remo en polea baja': 'seated cable row',
  'Russian twist': 'weighted russian twist',
  'Sentadilla con barra': 'barbell squat',
  'Zancadas con mancuernas': 'dumbbell lunge',
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

async function searchExercise(name) {
  try {
    // Search by exact name first
    const url = `${EXERCISE_API_BASE}/v2/exercises/name/${encodeURIComponent(name)}`
    const results = await fetchFromAPI(url)

    if (Array.isArray(results) && results.length > 0) {
      return results[0]
    }
    return null
  } catch (err) {
    console.warn(`  ⚠️  Search failed for "${name}": ${err.message}`)
    return null
  }
}

async function backfillExercises() {
  console.log('🔗 Backfilling exercise video links...\n')

  // 1. Get the 37 exercises currently in sessions
  console.log('📦 Fetching exercises used in sessions...')
  const { data: sessionExercises, error: seError } = await supabase
    .from('session_exercises')
    .select('exercise_id')

  if (seError) {
    console.error('❌ Error fetching session_exercises:', seError.message)
    process.exit(1)
  }

  const exerciseIds = [...new Set(sessionExercises.map((se) => se.exercise_id))]
  console.log(`✅ Found ${exerciseIds.length} distinct exercises in sessions\n`)

  // 2. Get the details of these exercises
  const { data: exercises, error: exError } = await supabase
    .from('exercises')
    .select('id, name')
    .in('id', exerciseIds)

  if (exError) {
    console.error('❌ Error fetching exercise details:', exError.message)
    process.exit(1)
  }

  const exercisesByName = Object.fromEntries(exercises.map((e) => [e.name, e]))

  // 3. For each exercise, search ExerciseDB and link via UPDATE
  console.log(`🔍 Searching ExerciseDB for ${exercises.length} exercises...\n`)

  const results = {
    matched: 0,
    notFound: [],
    errors: [],
  }

  for (const exercise of exercises) {
    const translation = exerciseTranslations[exercise.name]
    if (!translation) {
      results.notFound.push(`${exercise.name} (no translation mapping)`)
      continue
    }

    console.log(`  Searching for "${exercise.name}" → "${translation}"...`)

    try {
      const dbExercise = await searchExercise(translation)

      if (dbExercise && dbExercise.id) {
        // UPDATE the existing exercise with external_id
        const { error: updateError } = await supabase
          .from('exercises')
          .update({ external_id: dbExercise.id })
          .eq('id', exercise.id)

        if (updateError) {
          results.errors.push(`${exercise.name}: ${updateError.message}`)
          console.log(`    ❌ Update failed: ${updateError.message}`)
        } else {
          results.matched++
          console.log(`    ✅ Linked to ExerciseDB ID: ${dbExercise.id}`)
        }
      } else {
        results.notFound.push(exercise.name)
        console.log(`    ⚠️  No match found`)
      }
    } catch (err) {
      results.errors.push(`${exercise.name}: ${err.message}`)
      console.log(`    ❌ Error: ${err.message}`)
    }

    // Respectful delay between API requests
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // 4. Summary
  console.log('\n========================================')
  console.log(`Backfill complete!`)
  console.log(`Matched: ${results.matched}/${exercises.length}`)
  if (results.notFound.length > 0) {
    console.log(`\nNo matches found for:`)
    results.notFound.forEach((name) => console.log(`  - ${name}`))
  }
  if (results.errors.length > 0) {
    console.log(`\nErrors:`)
    results.errors.forEach((err) => console.log(`  - ${err}`))
  }
  console.log('========================================')

  if (results.matched > 0) {
    // Verify by counting
    const { count } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .not('external_id', 'is', null)

    console.log(`\nTotal exercises with external_id in database: ${count}`)
  }
}

backfillExercises()
