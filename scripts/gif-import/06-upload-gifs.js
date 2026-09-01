// Stage 6: uploads each exercise's .gif to the "exercise-gifs" Storage bucket
// under `${id}.gif`, matching the image_url already written in Stage 2/5.
// Resumable: skips objects that already exist in the bucket. Runs with
// bounded concurrency since this is ~1.5GB across 1222 files.
require('dotenv').config()
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const SCRATCH = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad/gif-import'
const BUCKET = 'exercise-gifs'
const CONCURRENCY = 6

async function listExistingObjects() {
  const existing = new Set()
  let offset = 0
  const limit = 1000
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list('', { limit, offset })
    if (error) { console.error('list error:', error); process.exit(1) }
    if (!data || data.length === 0) break
    for (const obj of data) existing.add(obj.name)
    if (data.length < limit) break
    offset += limit
  }
  return existing
}

async function uploadOne(exercise) {
  const objectName = `${exercise.id}.gif`
  const fileBuffer = fs.readFileSync(exercise.storage_source_path)
  const { error } = await supabase.storage.from(BUCKET).upload(objectName, fileBuffer, {
    contentType: 'image/gif',
    upsert: false,
  })
  if (error) throw error
}

async function main() {
  const exercises = JSON.parse(fs.readFileSync(`${SCRATCH}/exercises-final.json`, 'utf8'))
  console.log(`Listando objetos ya subidos en el bucket...`)
  const existing = await listExistingObjects()
  console.log(`Ya hay ${existing.size} objetos en el bucket.`)

  const pending = exercises.filter((e) => !existing.has(`${e.id}.gif`))
  console.log(`Pendientes de subir: ${pending.length}/${exercises.length}`)

  let done = 0
  let errors = 0
  const errorLog = []

  async function worker(queue) {
    while (queue.length > 0) {
      const exercise = queue.shift()
      try {
        await uploadOne(exercise)
        done++
        if (done % 50 === 0) console.log(`  ...${done}/${pending.length} subidos`)
      } catch (err) {
        errors++
        errorLog.push({ id: exercise.id, name_es: exercise.name_es, path: exercise.storage_source_path, error: err.message })
        console.error(`  ❌ ${exercise.name_es}: ${err.message}`)
      }
    }
  }

  const queue = [...pending]
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)))

  fs.writeFileSync(`${SCRATCH}/upload-errors.json`, JSON.stringify(errorLog, null, 2))
  console.log(`\nCompleto. Subidos: ${done}, errores: ${errors}`)
  if (errors > 0) console.log('Ver detalle en upload-errors.json — reintentar corriendo este script de nuevo (resumable).')
}

main()
