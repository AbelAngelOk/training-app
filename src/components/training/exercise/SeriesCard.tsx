import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import type { WorkoutSet } from '@/types/training'

interface SeriesCardProps {
  set: WorkoutSet
  index: number
  totalSets: number
  onWeightChange: (value: string) => void
  onRepsChange: (value: string) => void
  onToggle: () => void
}

export function SeriesCard({ set, index, totalSets, onWeightChange, onRepsChange, onToggle }: SeriesCardProps) {
  return (
    <View style={[styles.card, set.completed && styles.cardCompleted]}>
      <View style={styles.indexBox}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={String(set.weight)}
          onChangeText={onWeightChange}
          keyboardType="decimal-pad"
          selectTextOnFocus
          returnKeyType="done"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Reps</Text>
        <TextInput
          style={styles.input}
          value={String(set.reps)}
          onChangeText={onRepsChange}
          keyboardType="number-pad"
          selectTextOnFocus
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity
        style={[styles.checkbox, set.completed && styles.checkboxDone]}
        onPress={onToggle}
        hitSlop={8}
      >
        {set.completed && (
          <Ionicons name="checkmark" size={16} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 14,
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardCompleted: {
    borderColor: WolfTheme.colors.success + '40',
    backgroundColor: WolfTheme.colors.success + '08',
  },
  indexBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: WolfTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 13,
    fontWeight: '700',
    color: WolfTheme.colors.textSecondary,
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  inputLabel: {
    fontSize: 11,
    color: WolfTheme.colors.textSecondary,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: WolfTheme.colors.border,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: WolfTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: WolfTheme.colors.success,
    borderColor: WolfTheme.colors.success,
  },
})
