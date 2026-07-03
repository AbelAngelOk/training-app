import { useThemeStore } from '@/stores/theme-store'

export function useTheme() {
  return useThemeStore((state) => state.theme)
}
