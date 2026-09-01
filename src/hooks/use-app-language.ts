import { getLocales } from 'expo-localization'

import type { AppLanguage } from '@/lib/i18n'

/**
 * Idioma de contenido de catálogo según el locale del dispositivo. Sin
 * preferencia persistida ni pantalla de configuración — ver docs/I18N.md.
 */
export function useAppLanguage(): AppLanguage {
  const deviceLanguage = getLocales()[0]?.languageCode
  return deviceLanguage === 'en' ? 'en' : 'es'
}
