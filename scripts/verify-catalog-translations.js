#!/usr/bin/env node
/**
 * Cuenta filas con name_es/name_en nulo en exercises/muscle_groups/equipment.
 * Tiene que dar 0 en las 3 antes de aplicar la migración que borra las columnas
 * legadas de un solo idioma (20260810000023_drop_legacy_exercise_columns.sql).
 */
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials (EXPO_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function countUntranslated(table) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .or('name_es.is.null,name_en.is.null')
  if (error) {
    console.error(`Error verificando ${table}:`, error.message)
    process.exit(1)
  }
  return count
}

async function main() {
  const tables = ['exercises', 'muscle_groups', 'equipment']
  let allZero = true
  for (const table of tables) {
    const count = await countUntranslated(table)
    console.log(`${table}: ${count} filas sin traducir`)
    if (count > 0) allZero = false
  }

  if (allZero) {
    console.log('\n✅ Todo traducido. Se puede aplicar la migración 20260810000023_drop_legacy_exercise_columns.sql.')
  } else {
    console.log('\n❌ Todavía faltan traducciones. No aplicar la migración de drop de columnas legadas.')
    process.exit(1)
  }
}

main()
