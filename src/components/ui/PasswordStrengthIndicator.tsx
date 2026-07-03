import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

function getStrength(password: string): { level: 0 | 1 | 2; metCount: number } {
  const checks = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
    password.length >= 8,
  ]
  const metCount = checks.filter(Boolean).length
  if (metCount <= 2) return { level: 0, metCount }
  if (metCount <= 4) return { level: 1, metCount }
  return { level: 2, metCount }
}

const STRENGTH_COLORS = [
  WolfTheme.colors.error,
  WolfTheme.colors.warning,
  WolfTheme.colors.success,
] as const

const STRENGTH_LABELS = ['Débil', 'Media', 'Fuerte'] as const

interface PasswordStrengthIndicatorProps {
  password: string
  testID?: string
}

export function PasswordStrengthIndicator({ password, testID }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const { level, metCount } = getStrength(password)
  const color = STRENGTH_COLORS[level]

  const criteria = [
    {
      label: 'Al menos una mayúscula',
      met: /[A-Z]/.test(password),
      testID: 'register-password-criteria-uppercase',
    },
    {
      label: 'Al menos una minúscula',
      met: /[a-z]/.test(password),
      testID: 'register-password-criteria-lowercase',
    },
    {
      label: 'Al menos un número',
      met: /[0-9]/.test(password),
      testID: 'register-password-criteria-number',
    },
    {
      label: 'Al menos un carácter especial',
      met: /[^A-Za-z0-9]/.test(password),
      testID: 'register-password-criteria-special',
    },
    {
      label: 'Mínimo 8 caracteres',
      met: password.length >= 8,
      testID: 'register-password-criteria-length',
    },
  ]

  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${(metCount / 5) * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.strengthLabel, { color }]}>{STRENGTH_LABELS[level]}</Text>
      <View style={styles.criteriaList}>
        {criteria.map((c) => (
          <View key={c.testID} testID={c.testID} style={styles.criteriaRow}>
            <Ionicons
              name={c.met ? 'checkmark-circle' : 'ellipse-outline'}
              size={14}
              color={c.met ? WolfTheme.colors.success : WolfTheme.colors.textSecondary}
            />
            <Text style={[styles.criteriaText, c.met && styles.criteriaTextMet]}>
              {c.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: WolfTheme.spacing.xs,
    marginTop: WolfTheme.spacing.xs,
  },
  barTrack: {
    height: 4,
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  criteriaList: {
    gap: 4,
    marginTop: WolfTheme.spacing.xs,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  criteriaText: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  criteriaTextMet: {
    color: WolfTheme.colors.success,
  },
})
