// Temporary test script: the fitgifs API was updated with a new
// "biblioteca_ejercicios" source (1222 entries) that is the exact same data
// as the GIF library we imported into Supabase Storage (scripts/gif-import/).
// This matches our 1222 exercises against that source by exact normalized
// name and sets fitgifs_slug — since ExerciseGifDisplay tries fitgifs_slug
// before image_url, this makes the (now-updated, being tested) fitgifs API
// the primary GIF source for these rows, Storage stays as the fallback.
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const FITGIFS_API_BASE = process.env.FITGIFS_API_URL || 'https://api-training-app.onrender.com'

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function main() {
  console.log('Descargando catálogo fitgifs...')
  const res = await fetch(`${FITGIFS_API_BASE}/exercises`, { signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`fitgifs API error: ${res.status}`)
  const { results } = await res.json()
  const biblio = results.filter((r) => r.source === 'biblioteca_ejercicios' && r.has_gif)
  console.log(`biblioteca_ejercicios con gif: ${biblio.length}`)

  const bySpanishName = new Map()
  for (const c of biblio) bySpanishName.set(normalize(c.name_es), c.slug)

  // our 1222 imported exercises: fitgifs_slug null, image_url pointing at our own bucket
  const { data: rows, error } = await supabase
    .from('exercises')
    .select('id, name_es')
    .is('fitgifs_slug', null)
    .not('image_url', 'is', null)
  if (error) throw error
  console.log(`Ejercicios candidatos (nuestra biblioteca, sin fitgifs_slug): ${rows.length}`)

  let matched = 0
  let unmatched = 0
  const unmatchedNames = []

  for (const row of rows) {
    const slug = bySpanishName.get(normalize(row.name_es))
    if (!slug) {
      unmatched++
      unmatchedNames.push(row.name_es)
      continue
    }
    // sanity: confirm the gif actually resolves before committing
    const { error: updateError } = await supabase.from('exercises').update({ fitgifs_slug: slug }).eq('id', row.id)
    if (updateError) { console.error(`  ❌ ${row.name_es}: ${updateError.message}`); continue }
    matched++
  }

  console.log(`\nMatched (exact, misma fuente): ${matched}`)
  console.log(`Sin match: ${unmatched}`)
  if (unmatchedNames.length > 0) {
    console.log('Nombres sin match (probablemente los 7 corregidos a mano):')
    console.log(unmatchedNames)
  }
}

main()
