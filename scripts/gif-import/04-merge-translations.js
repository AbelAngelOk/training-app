// Stage 4: merges the 6 translated name chunks into a single name_es -> name_en
// map, then applies it to exercises-import.json, producing the final dataset
// ready for insertion.
const fs = require('fs')

const SCRATCH = 'C:/Users/abela/AppData/Local/Temp/claude/c--Users-abela-OneDrive-Desktop-Proyectos-training-app/a89ed7c8-22bd-4ed4-a89d-b843c5390a31/scratchpad/gif-import'

const exercises = JSON.parse(fs.readFileSync(`${SCRATCH}/exercises-import.json`, 'utf8'))
const distinctNames = JSON.parse(fs.readFileSync(`${SCRATCH}/distinct-names-es.json`, 'utf8'))

const translationMap = new Map()
for (let i = 1; i <= 6; i++) {
  const chunk = JSON.parse(fs.readFileSync(`${SCRATCH}/names-chunk-${i}-translated.json`, 'utf8'))
  for (const { name_es, name_en } of chunk) translationMap.set(name_es, name_en)
}

const missing = distinctNames.filter((n) => !translationMap.has(n))
if (missing.length > 0) {
  console.error(`Faltan traducciones para ${missing.length} nombres:`, missing.slice(0, 20))
  process.exit(1)
}

const finalExercises = exercises.map((e) => ({
  ...e,
  name_en: translationMap.get(e.name_es),
}))

const missingEn = finalExercises.filter((e) => !e.name_en || !e.name_en.trim())
if (missingEn.length > 0) {
  console.error(`${missingEn.length} exercises sin name_en resuelto`)
  process.exit(1)
}

fs.writeFileSync(`${SCRATCH}/exercises-final.json`, JSON.stringify(finalExercises, null, 2))
console.log(`OK: ${finalExercises.length} exercises con name_en resuelto. Escrito exercises-final.json`)
