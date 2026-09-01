// Stage 3: creates the public "exercise-gifs" Storage bucket (idempotent).
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const BUCKET = 'exercise-gifs'

async function main() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) { console.error(listError); process.exit(1) }

  if (buckets.some((b) => b.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" ya existe.`)
    return
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: '10MB',
    allowedMimeTypes: ['image/gif'],
  })
  if (error) { console.error('createBucket error:', error); process.exit(1) }
  console.log(`Bucket "${BUCKET}" creado (público, solo image/gif, límite 10MB por archivo).`)
}

main()
