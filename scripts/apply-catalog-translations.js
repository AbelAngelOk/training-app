#!/usr/bin/env node
/**
 * Aplica las traducciones generadas en scripts/translation-work/ a las columnas
 * bilingües de exercises/muscle_groups/equipment. Idempotente (siempre hace UPDATE
 * por id) y falla fuerte si falta la traducción de alguna fila viva en la base.
 */
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials (EXPO_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const WORK_DIR = path.join(__dirname, 'translation-work')

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(WORK_DIR, file), 'utf8'))
}

async function applyExercises() {
  const translations = readJson('exercises-translations.json')

  const { data: liveRows, error } = await supabase.from('exercises').select('id')
  if (error) {
    console.error('Error leyendo exercises:', error.message)
    process.exit(1)
  }

  const byId = new Map(translations.map((t) => [t.id, t]))
  const missing = liveRows.filter((r) => !byId.has(r.id))
  if (missing.length > 0) {
    console.error(`Faltan traducciones para ${missing.length} exercises vivos:`, missing.map((r) => r.id))
    process.exit(1)
  }

  console.log(`Aplicando traducciones a ${translations.length} exercises...`)
  let updated = 0
  for (const t of translations) {
    const { error: updateError } = await supabase
      .from('exercises')
      .update({
        name_es: t.name_es,
        name_en: t.name_en,
        description_es: t.description_es,
        description_en: t.description_en,
        instructions_es: t.instructions_es,
        instructions_en: t.instructions_en,
        tips_es: t.tips_es ?? null,
        tips_en: t.tips_en ?? null,
      })
      .eq('id', t.id)

    if (updateError) {
      console.error(`  ❌ exercise ${t.id}: ${updateError.message}`)
      process.exit(1)
    }
    updated++
    if (updated % 50 === 0) console.log(`  ...${updated}/${translations.length}`)
  }
  console.log(`✅ exercises: ${updated} filas actualizadas`)
}

async function applyCatalog() {
  const { muscleGroups, equipment } = readJson('catalog-translations.json')

  const { data: liveMuscleGroups, error: mgError } = await supabase.from('muscle_groups').select('id')
  if (mgError) {
    console.error('Error leyendo muscle_groups:', mgError.message)
    process.exit(1)
  }
  const mgById = new Map(muscleGroups.map((t) => [t.id, t]))
  const missingMg = liveMuscleGroups.filter((r) => !mgById.has(r.id))
  if (missingMg.length > 0) {
    console.error(`Faltan traducciones para ${missingMg.length} muscle_groups vivos:`, missingMg.map((r) => r.id))
    process.exit(1)
  }

  for (const t of muscleGroups) {
    const { error: updateError } = await supabase
      .from('muscle_groups')
      .update({
        name_es: t.name_es,
        name_en: t.name_en,
        description_es: t.description_es,
        description_en: t.description_en,
      })
      .eq('id', t.id)
    if (updateError) {
      console.error(`  ❌ muscle_group ${t.id}: ${updateError.message}`)
      process.exit(1)
    }
  }
  console.log(`✅ muscle_groups: ${muscleGroups.length} filas actualizadas`)

  const { data: liveEquipment, error: eqError } = await supabase.from('equipment').select('id')
  if (eqError) {
    console.error('Error leyendo equipment:', eqError.message)
    process.exit(1)
  }
  const eqById = new Map(equipment.map((t) => [t.id, t]))
  const missingEq = liveEquipment.filter((r) => !eqById.has(r.id))
  if (missingEq.length > 0) {
    console.error(`Faltan traducciones para ${missingEq.length} equipment vivos:`, missingEq.map((r) => r.id))
    process.exit(1)
  }

  for (const t of equipment) {
    const { error: updateError } = await supabase
      .from('equipment')
      .update({
        name_es: t.name_es,
        name_en: t.name_en,
        description_es: t.description_es,
        description_en: t.description_en,
      })
      .eq('id', t.id)
    if (updateError) {
      console.error(`  ❌ equipment ${t.id}: ${updateError.message}`)
      process.exit(1)
    }
  }
  console.log(`✅ equipment: ${equipment.length} filas actualizadas`)
}

async function main() {
  await applyExercises()
  await applyCatalog()
  console.log('\nBackfill de traducciones completo. Ejecutar scripts/verify-catalog-translations.js para confirmar.')
}

main()
