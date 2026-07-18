#!/usr/bin/env node
/**
 * Sync exercises.fitgifs_slug against the fitgifs API (api-training-app.onrender.com).
 * Fetches the full remote catalog once and matches it in-memory against local
 * exercises that don't have a fitgifs_slug yet. Idempotent — rerun any time,
 * already-linked (or manually corrected) rows are skipped.
 */
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

const FITGIFS_API_BASE = process.env.FITGIFS_API_URL || 'https://api-training-app.onrender.com'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const FUZZY_THRESHOLD = 0.75
const PAGE_SIZE = 1000

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents (á->a, é->e, ...)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // hyphens/punctuation -> space
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  let curr = new Array(n + 1)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

function levRatio(a, b) {
  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length, 1)
  return 1 - dist / maxLen
}

/**
 * Tiered match: exact normalized name (either language) -> containment (one
 * name is a substring of the other, either language) -> best Levenshtein
 * ratio across all candidates if it clears FUZZY_THRESHOLD -> no match.
 * Returns { tier: 'exact'|'containment'|'fuzzy'|'none', candidate, score }
 */
function matchExercise(localName, candidates) {
  const n = normalize(localName)
  if (!n) return { tier: 'none', candidate: null, score: 0 }

  const exact = candidates.find((c) => c.n_en === n || c.n_es === n)
  if (exact) return { tier: 'exact', candidate: exact, score: 1 }

  const contained = candidates.filter(
    (c) => c.n_en.includes(n) || n.includes(c.n_en) || c.n_es.includes(n) || n.includes(c.n_es)
  )
  if (contained.length > 0) {
    const best = contained.reduce((a, b) => {
      const da = Math.min(Math.abs(a.n_en.length - n.length), Math.abs(a.n_es.length - n.length))
      const db = Math.min(Math.abs(b.n_en.length - n.length), Math.abs(b.n_es.length - n.length))
      return db < da ? b : a
    })
    return { tier: 'containment', candidate: best, score: null }
  }

  let best = null
  let bestScore = -1
  for (const c of candidates) {
    const score = Math.max(levRatio(n, c.n_en), levRatio(n, c.n_es))
    if (score > bestScore) {
      bestScore = score
      best = c
    }
  }
  if (bestScore >= FUZZY_THRESHOLD) return { tier: 'fuzzy', candidate: best, score: bestScore }

  return { tier: 'none', candidate: null, score: bestScore }
}

async function fetchJson(url, timeoutMs) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!response.ok) {
    throw new Error(`fitgifs API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function wakeUpAndFetchCatalog() {
  console.log(
    '⏳ Contactando fitgifs API (el servicio gratuito de Render puede tardar 30-60s en despertar)...'
  )
  await fetchJson(`${FITGIFS_API_BASE}/health`, 60_000)
  console.log('✅ Servicio despierto. Descargando catálogo completo...')
  const { count, results } = await fetchJson(`${FITGIFS_API_BASE}/exercises`, 60_000)
  const withGif = results.filter((r) => r.has_gif)
  console.log(`📦 Catálogo fitgifs: ${count} ejercicios (${withGif.length} con GIF)\n`)
  return withGif.map((c) => ({ ...c, n_en: normalize(c.name_en), n_es: normalize(c.name_es) }))
}

async function syncFitgifs() {
  console.log('🌱 Sincronizando exercises.fitgifs_slug con fitgifs API...\n')

  const candidates = await wakeUpAndFetchCatalog()

  const report = { exact: [], containment: [], fuzzy: [], unmatched: [], errors: [] }
  let processed = 0
  let offset = 0

  while (true) {
    const { data: rows, error } = await supabase
      .from('exercises')
      .select('id, name')
      .is('fitgifs_slug', null)
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error('❌ Error paginando exercises:', error.message)
      process.exit(1)
    }
    if (!rows || rows.length === 0) break

    for (const row of rows) {
      processed++
      try {
        const result = matchExercise(row.name, candidates)

        if (result.tier === 'none') {
          report.unmatched.push({ id: row.id, name: row.name, bestScore: Number(result.score.toFixed(3)) })
          console.log(`  ⏭️  "${row.name}" — sin match (mejor score: ${result.score.toFixed(2)})`)
          continue
        }

        const { error: updateError } = await supabase
          .from('exercises')
          .update({ fitgifs_slug: result.candidate.slug })
          .eq('id', row.id)

        if (updateError) {
          report.errors.push({ id: row.id, name: row.name, error: updateError.message })
          console.log(`  ❌ "${row.name}": ${updateError.message}`)
          continue
        }

        const entry = {
          id: row.id,
          name: row.name,
          slug: result.candidate.slug,
          matchedName: result.candidate.name_en,
          score: result.score === null ? null : Number(result.score.toFixed(3)),
        }
        report[result.tier].push(entry)
        const icon = result.tier === 'exact' ? '✅' : '🔗'
        console.log(`  ${icon} "${row.name}" → "${result.candidate.slug}" (${result.tier})`)
      } catch (err) {
        report.errors.push({ id: row.id, name: row.name, error: err.message })
        console.log(`  ❌ "${row.name}": ${err.message}`)
      }
    }

    offset += PAGE_SIZE
  }

  console.log('\n========================================')
  console.log('Fitgifs sync completo!')
  console.log(`Total procesado: ${processed}`)
  console.log(`  Alta confianza (exact match): ${report.exact.length}`)
  console.log(`  Media confianza (containment): ${report.containment.length}`)
  console.log(`  Media confianza (fuzzy >= ${FUZZY_THRESHOLD}): ${report.fuzzy.length}`)
  console.log(`  Sin match: ${report.unmatched.length}`)
  console.log(`  Errores: ${report.errors.length}`)
  console.log('========================================')

  const fs = require('fs')
  const path = require('path')
  fs.writeFileSync(
    path.join(__dirname, 'fitgifs-sync-report.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), ...report }, null, 2)
  )
  console.log('\n📄 Reporte completo (media confianza + sin match) en: scripts/fitgifs-sync-report.json')

  const { count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .not('fitgifs_slug', 'is', null)
  console.log(`\nTotal exercises con fitgifs_slug en la base: ${count}`)
}

syncFitgifs()
