/**
 * Exercise GIF API
 * Builds the display URL for an exercise's GIF from the fitgifs API using the
 * exercises.fitgifs_slug reference resolved by scripts/sync-fitgifs.js.
 * No network round-trip needed here — /gif/{slug} is a plain static image URL.
 */
const FITGIFS_API_BASE =
  process.env.EXPO_PUBLIC_FITGIFS_API_URL || 'https://api-training-app.onrender.com'

export function getExerciseGifUrl(fitgifsSlug: string | null): string | null {
  if (!fitgifsSlug) return null
  return `${FITGIFS_API_BASE}/gif/${encodeURIComponent(fitgifsSlug)}`
}
