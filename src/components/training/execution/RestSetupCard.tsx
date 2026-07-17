import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

const QUICK_OPTIONS = [30, 60, 90, 120]

interface RestSetupCardProps {
  seconds: number
  onChangeSeconds: (seconds: number) => void
}

/**
 * First step of the mandatory setup wizard: a single global rest-between-sets
 * question that applies to every exercise of the session.
 */
export function RestSetupCard({ seconds, onChangeSeconds }: RestSetupCardProps) {
  const handleTextChange = (value: string) => {
    const parsed = Number(value)
    onChangeSeconds(Number.isFinite(parsed) ? Math.max(0, parsed) : 0)
  }

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="timer-outline" size={40} color={WolfTheme.colors.primary} />
      </View>

      <Text style={styles.title}>¿Cuánto descansás entre series?</Text>
      <Text style={styles.subtitle}>
        Se va a aplicar a todos los ejercicios de esta sesión. Podés cambiarlo más adelante.
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={String(seconds)}
          onChangeText={handleTextChange}
          keyboardType="number-pad"
          selectTextOnFocus
          returnKeyType="done"
        />
        <Text style={styles.inputUnit}>segundos</Text>
      </View>

      <View style={styles.chipsRow}>
        {QUICK_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.chip, seconds === option && styles.chipActive]}
            onPress={() => onChangeSeconds(option)}
          >
            <Text style={[styles.chipText, seconds === option && styles.chipTextActive]}>
              {option}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.xxl,
  },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: WolfTheme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: WolfTheme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: WolfTheme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    marginTop: WolfTheme.spacing.md,
  },
  input: {
    width: 100,
    height: 64,
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  inputUnit: {
    fontSize: 15,
    color: WolfTheme.colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.sm,
    marginTop: WolfTheme.spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: WolfTheme.colors.surfaceLight,
  },
  chipActive: {
    backgroundColor: 'rgba(139,92,246,0.18)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  chipTextActive: {
    color: WolfTheme.colors.primary,
  },
})
