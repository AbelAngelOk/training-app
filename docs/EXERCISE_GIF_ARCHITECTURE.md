# Exercise GIF Architecture

## Overview

Exercise GIFs come from **two independent sources**, never both on the same row:

1. **fitgifs API** (`https://api-training-app.onrender.com`) — on-demand, external. Only `fitgifs_slug` is stored; the GIF itself is never downloaded. Covers exercises matched by `scripts/sync-fitgifs.js` (~223/373 of the original catalog).
2. **Supabase Storage** (bucket `exercise-gifs`, public) — self-hosted. `image_url` stores the public Storage URL directly. Covers the ~1222 exercises imported from a GIF library in August 2026 (`scripts/gif-import/`), which fitgifs doesn't have.

`ExerciseGifDisplay.tsx` tries `fitgifs_slug` first, falls back to `image_url` if null — see `src/components/training/ExerciseGifDisplay.tsx`.

This replaces the earlier ExerciseDB-based video system (`external_id` + `expo-video`). `external_id` still exists and is still used, but only for the one-time exercise **catalog** import (`seed:exercises`) — it has nothing to do with visual display anymore.

## Rationale

**No auth, no rate limit**: fitgifs is self-hosted and requires no API key, unlike ExerciseDB's RapidAPI tier (100 requests/day on the free plan).

**Simpler runtime**: `/gif/{slug}` is a plain static image URL with `Cache-Control: public, max-age=604800` — there is nothing to fetch as JSON, cache in a query client, or retry. RN's native `<Image>` component already has the loading/error lifecycle needed.

**Graceful degradation**: if `fitgifs_slug` is null or the GIF fails to load, the exercise still works with instructions and tips in plain text — unchanged from the old system.

## Data Flow

### 1. Sync (one-time / re-runnable)

```
fitgifs API
    ↓ (GET /exercises — full catalog, ~1234 exercises, one call)
[scripts/sync-fitgifs.js]
    ↓ (normalize + match against local exercises without fitgifs_slug yet)
Supabase exercises table
    ↓ (UPDATE fitgifs_slug — never inserts new rows)
scripts/fitgifs-sync-report.json
    ↓ (medium-confidence + unmatched cases, for manual review)
```

Run script:
```bash
npm run sync:fitgifs
```

Idempotent: already-linked exercises are skipped, so it's safe to rerun whenever new local exercises are added or the fitgifs catalog grows. Ambiguous/unmatched cases can be corrected by hand via the "Slug de fitgifs" field on `/admin/exercises/{id}`.

### 2. Bulk import from a GIF library (one-time, August 2026)

A separate ~1222-exercise GIF library (not affiliated with fitgifs) was normalized and imported directly into Supabase Storage, for exercises fitgifs doesn't cover:

```
Source library (renamed to Spanish, metadata inferred — see the library's own docs/)
    ↓
[scripts/gif-import/01-reconcile-catalog.js] — reuses/creates muscle_groups & equipment
    ↓
[scripts/gif-import/02-build-exercise-rows.js] — client-side uuid per exercise, resolves category ids
    ↓ (name_en generated — batch-translated, source library only had Spanish names)
[scripts/gif-import/03-create-bucket.js] — creates the public "exercise-gifs" bucket
    ↓
[scripts/gif-import/05-insert-exercises.js] — bulk INSERT exercises + junction rows (external_id left NULL — these aren't from ExerciseDB)
    ↓
[scripts/gif-import/06-upload-gifs.js] — uploads each `${id}.gif` to Storage, resumable
    ↓
exercises.image_url = public Storage URL (set upfront in step 2, matching the id used in step 6)
```

Not wired into `npm run` scripts (one-time, not re-runnable against a changed source library) — kept in `scripts/gif-import/` as a record of how the import was done, should something similar be needed again.

### 3. Exercise Display (Runtime)

```
src/components/training/ExerciseGifDisplay.tsx
    ↓ (getExerciseGifUrl(exercise.fitgifs_slug) || exercise.image_url)
src/api/exercise-gif.ts
    ↓ (pure string interpolation, no network call, only for the fitgifs_slug branch)
`${FITGIFS_API_BASE}/gif/{slug}`  — or the Storage public URL directly
    ↓ (passed straight to <Image source={{uri}}>)
User sees animated GIF, or falls back to instructions/tips on error
```

## Schema Changes

### exercises table

**ADDED:**
- `fitgifs_slug` (text, nullable, no UNIQUE) — fitgifs API slug. No UNIQUE constraint because multiple local exercise variants may legitimately resolve to the same GIF.

**REPURPOSED:**
- `image_url` (text, nullable, pre-existing) — now the public Storage URL for exercises imported via `scripts/gif-import/` (bucket `exercise-gifs`). Previously unused (0 rows had it set before the August 2026 import).

**UNCHANGED:**
- `external_id` — still used, only for ExerciseDB catalog import (`seed:exercises`), unrelated to display now. Left `NULL` for GIF-library imports — they aren't from ExerciseDB, so setting it would be a false dedup marker.

### Supabase Storage

- Bucket `exercise-gifs` — public, `image/gif` only, 10MB per-file limit. Object key = `${exercise.id}.gif`.

## API Contract (fitgifs, verified directly — no auth needed)

```
GET /health                    -> { count, status, with_gif }
GET /exercises                 -> { count, results: Exercise[] }   (full catalog, one call)
GET /search?q=...&limit=N      -> { count, query, results: Exercise[] }  (literal substring match only — not used by the sync script)
GET /exercise/{clave}          -> Exercise   (clave = id, slug, or name en/es)
GET /gif/{clave}                -> raw .gif binary (image/gif), Cache-Control: 7d
```

```typescript
interface Exercise {
  id: number
  slug: string
  name_en: string
  name_es: string
  gif: string          // filename, e.g. "burpees.gif"
  has_gif: boolean
  gif_url: string       // "/gif/{slug}"
}
```

## Code Locations

| File | Purpose |
|------|---------|
| `src/api/exercise-gif.ts` | Builds the `/gif/{slug}` display URL — no network call |
| `src/components/training/ExerciseGifDisplay.tsx` | UI component, replaces the old video display, tries `fitgifs_slug` then `image_url` |
| `scripts/sync-fitgifs.js` | Sync/matching script (skips rows that already have `image_url`) |
| `scripts/gif-import/` | One-time bulk import from the August 2026 GIF library into Storage + `image_url` |
| `supabase/migrations/20260718000018_*.sql` | Schema migration (`fitgifs_slug`) |
| `src/components/training/execution/ExecutionExerciseCard.tsx` | Uses it during guided workout execution (lazy, only the active pager slide) |
| `src/app/(tabs)/training/exercise/[id].tsx` | Uses it on the exercise detail screen |
| `src/components/admin/ExerciseForm.tsx` | Manual `fitgifs_slug`/`image_url` correction fields in the admin dashboard |

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `fitgifs_slug` and `image_url` both null (no match found during sync, no Storage image) | Show instructions + tips, no GIF, no error message |
| GIF fails to load (`Image.onError`) | Show "no se pudo cargar" message, fall back to instructions |
| Render cold start during sync (free tier sleeps after inactivity) | `sync-fitgifs.js` uses a 60s timeout on `/health` and `/exercises`; no retry loop |
| Sync finds no match / low-confidence match | Logged to `scripts/fitgifs-sync-report.json`, correctable by hand in the admin dashboard |

### Implementation

```tsx
const gifUrl = getExerciseGifUrl(exercise.fitgifs_slug) || exercise.image_url
const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(gifUrl ? 'loading' : 'error')
// status !== 'loaded' && showInstructions -> render instructions/tips fallback instead
```

## Caching Strategy

No client-side data-fetching cache (no React Query hook) — there is nothing to fetch as data, only a URL to build. Caching is handled by:
- The server's `Cache-Control: public, max-age=604800` header on `/gif/{slug}`.
- The platform's native image cache (RN `<Image>` on iOS/Android, the browser's own cache on web).

## Matching Algorithm (`scripts/sync-fitgifs.js`)

Local exercise names are a mix of English (ExerciseDB import, ~1523 rows) and Spanish (original hand-seeded rows, ~44). fitgifs' `/search` endpoint only does literal substring matching, not fuzzy — so the sync script instead downloads the **entire** fitgifs catalog once and matches in-memory, tiered:

1. **Exact** — normalized name equals `name_en` or `name_es` of some candidate.
2. **Containment** — one normalized name is a substring of the other (either language), picking the closest-length candidate if several match.
3. **Fuzzy** — best Levenshtein-ratio across all candidates' `name_en`/`name_es`, accepted only if ≥ 0.75.
4. **None** — left unmatched (`fitgifs_slug` stays null), logged for manual review.

Tiers 2 and 3 are flagged in the report even when auto-accepted, since they're not a guaranteed-correct match.

## Environment Variables

None required — fitgifs needs no auth. Optional override for local testing against a self-hosted instance:
```
EXPO_PUBLIC_FITGIFS_API_URL=http://localhost:8080   # runtime (src/api/exercise-gif.ts)
FITGIFS_API_URL=http://localhost:8080               # scripts/sync-fitgifs.js
```

## Future Considerations

- Rerun `sync:fitgifs` periodically as new local exercises get added or fitgifs' catalog grows.
- Consider a lightweight in-app "browse fitgifs catalog and pick a slug" picker in the admin dashboard instead of pasting a slug by hand.
