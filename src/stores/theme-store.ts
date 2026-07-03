import { create } from 'zustand'

import { WolfTheme, type Theme } from '@/constants/colors'

type ThemeName = 'wolf'

interface ThemeState {
  themeName: ThemeName
  theme: Theme
  setTheme: (name: ThemeName) => void
}

const themes: Record<ThemeName, Theme> = {
  wolf: WolfTheme,
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeName: 'wolf',
  theme: WolfTheme,
  setTheme: (name) => set({ themeName: name, theme: themes[name] }),
}))
