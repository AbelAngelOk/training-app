export const WolfTheme = {
  colors: {
    background: '#09090B',
    surface: '#18181B',
    surfaceLight: '#27272A',
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    accent: '#7C3AED',
    accentLight: '#8B5CF6',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    border: 'rgba(255,255,255,0.08)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    card: 20,
    button: 16,
    modal: 28,
    input: 12,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '600' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 14, fontWeight: '400' as const },
  },
} as const

export type Theme = typeof WolfTheme
export type ThemeColors = typeof WolfTheme.colors
