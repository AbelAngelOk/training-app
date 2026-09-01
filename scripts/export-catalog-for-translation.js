#!/usr/bin/env node
/**
 * Vuelca exercises/muscle_groups/equipment a JSON en scripts/translation-work/
 * para generar las traducciones ES/EN. No escribe nada en la base.
 */
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const OUT_DIR = path.join(__dirname, 'translation-work')

async function exportAll() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const { data: exercises, error: exError } = await supabase
    .from('exercises')
    .select('id, name, description, instructions, tips, external_id')
    .order('id')
  if (exError) {
    console.error('Error exportando exercises:', exError.message)
    process.exit(1)
  }

  const { data: muscleGroups, error: mgError } = await supabase
    .from('muscle_groups')
    .select('id, name')
    .order('id')
  if (mgError) {
    console.error('Error exportando muscle_groups:', mgError.message)
    process.exit(1)
  }

  const { data: equipment, error: eqError } = await supabase
    .from('equipment')
    .select('id, name')
    .order('id')
  if (eqError) {
    console.error('Error exportando equipment:', eqError.message)
    process.exit(1)
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'exercises-source.json'),
    JSON.stringify(exercises, null, 2)
  )
  fs.writeFileSync(
    path.join(OUT_DIR, 'catalog-source.json'),
    JSON.stringify({ muscleGroups, equipment }, null, 2)
  )

  console.log(`Exportados ${exercises.length} exercises, ${muscleGroups.length} muscle_groups, ${equipment.length} equipment`)
  console.log(`Escritos en: ${OUT_DIR}`)
}

exportAll()
