import type { ExerciseDifficulty } from '@/types/database'

/**
 * Idioma de contenido de catálogo (ejercicios, grupos musculares, equipo,
 * dificultad). No cubre el resto de los strings de UI de la app — ver
 * docs/I18N.md para el alcance exacto.
 */
export type AppLanguage = 'es' | 'en'

/**
 * Devuelve el texto en el idioma pedido, con fallback al otro idioma si el
 * elegido viene vacío — nunca mostrar un nombre en blanco.
 */
export function getLocalizedText(
  es: string | null | undefined,
  en: string | null | undefined,
  language: AppLanguage
): string {
  const primary = language === 'es' ? es : en
  const fallback = language === 'es' ? en : es
  return primary || fallback || ''
}

export const DIFFICULTY_LABEL: Record<AppLanguage, Record<ExerciseDifficulty, string>> = {
  es: {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  },
  en: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },
}
