import { useRef, useState } from 'react'
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import type { Exercise, WorkoutSet } from '@/types/training'
import { SeriesCard } from './SeriesCard'
import { RestTimer } from './RestTimer'

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

interface ExerciseAccordionProps {
  exercise: Exercise
  index: number
  onSetsChange: (sets: WorkoutSet[]) => void
}

export function ExerciseAccordion({ exercise, index, onSetsChange }: ExerciseAccordionProps) {
  const [open, setOpen] = useState(false)
  const rotate = useRef(new Animated.Value(0)).current

  const completedCount = exercise.sets.filter((s) => s.completed).length
  const allDone = completedCount === exercise.sets.length

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen((prev) => !prev)
    Animated.timing(rotate, {
      toValue: open ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  const chevronRotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  const handleWeightChange = (i: number, value: string) => {
    const updated = exercise.sets.map((s, idx) =>
      idx === i ? { ...s, weight: parseFloat(value) || 0 } : s
    )
    onSetsChange(updated)
  }

  const handleRepsChange = (i: number, value: string) => {
    const updated = exercise.sets.map((s, idx) =>
      idx === i ? { ...s, reps: parseInt(value, 10) || 0 } : s
    )
    onSetsChange(updated)
  }

  const handleToggle = (i: number) => {
    const updated = exercise.sets.map((s, idx) =>
      idx === i ? { ...s, completed: !s.completed } : s
    )
    onSetsChange(updated)
  }

  const handleAddSet = () => {
    const last = exercise.sets[exercise.sets.length - 1]
    const newSet: WorkoutSet = {
      id: `${exercise.id}-s${exercise.sets.length + 1}`,
      weight: last?.weight ?? 0,
      reps: last?.reps ?? exercise.targetReps,
      completed: false,
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    onSetsChange([...exercise.sets, newSet])
  }

  return (
    <View style={[styles.container, allDone && styles.containerDone]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerContent} onPress={toggle} activeOpacity={0.8}>
          <View style={styles.indexPill}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.name}>{exercise.name}</Text>
            <Text style={styles.muscle}>{exercise.muscleGroup}</Text>
          </View>

          <View style={styles.headerRight}>
            {allDone && (
              <Ionicons name="checkmark-circle" size={20} color={WolfTheme.colors.success} />
            )}
            {!allDone && completedCount > 0 && (
              <Text style={styles.partialText}>{completedCount}/{exercise.sets.length}</Text>
            )}
            <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
              <Ionicons name="chevron-down" size={20} color={WolfTheme.colors.textSecondary} />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Video button */}
        <TouchableOpacity
          style={styles.videoBtn}
          onPress={() => router.push(`/(tabs)/training/exercise/${exercise.id}`)}
          hitSlop={8}
        >
          <Ionicons name="play-circle-outline" size={20} color={WolfTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Expanded content */}
      {open && (
        <View style={styles.body}>
          {/* Last performance */}
          <View style={styles.lastPerf}>
            <Text style={styles.lastPerfLabel}>Última vez</Text>
            <Text style={styles.lastPerfValue}>
              {exercise.lastWeight > 0
                ? `${exercise.lastWeight} kg × ${exercise.lastReps}`
                : `Peso corporal × ${exercise.lastReps}`}
            </Text>
            <View style={styles.dot} />
            <Text style={styles.lastPerfLabel}>Objetivo</Text>
            <Text style={styles.lastPerfValue}>
              {exercise.targetSets} × {exercise.targetReps}
            </Text>
          </View>

          {/* Sets */}
          <View style={styles.setsContainer}>
            {exercise.sets.map((set, i) => (
              <View key={set.id}>
                <SeriesCard
                  set={set}
                  index={i}
                  totalSets={exercise.sets.length}
                  onWeightChange={(v) => handleWeightChange(i, v)}
                  onRepsChange={(v) => handleRepsChange(i, v)}
                  onToggle={() => handleToggle(i)}
                />
                {/* Rest timer after each set except the last */}
                {i < exercise.sets.length - 1 && set.completed && (
                  <View style={styles.restSection}>
                    <View style={styles.restLabel}>
                      <Text style={styles.restLabelText}>
                        Descanso {i + 1}/{exercise.sets.length}
                      </Text>
                    </View>
                    <RestTimer seconds={exercise.restSeconds} />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Final rest timer after all sets */}
          {completedCount === exercise.sets.length && exercise.sets.length > 0 && (
            <View style={styles.finalRestSection}>
              <Text style={styles.finalRestLabel}>Descanso después del ejercicio</Text>
              <RestTimer seconds={exercise.restSeconds} />
            </View>
          )}

          {/* Add set */}
          <TouchableOpacity style={styles.addSetBtn} onPress={handleAddSet}>
            <Ionicons name="add-circle-outline" size={18} color={WolfTheme.colors.primary} />
            <Text style={styles.addSetText}>Agregar serie</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    overflow: 'hidden',
  },
  containerDone: {
    borderColor: WolfTheme.colors.success + '40',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
    minHeight: 64,
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
  },
  indexPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700',
    color: WolfTheme.colors.primary,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  muscle: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partialText: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.warning,
  },
  body: {
    paddingHorizontal: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
  },
  lastPerf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: WolfTheme.spacing.md,
    flexWrap: 'wrap',
  },
  lastPerfLabel: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  lastPerfValue: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: WolfTheme.colors.border,
  },
  setsContainer: {
    gap: WolfTheme.spacing.sm,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: WolfTheme.colors.primary + '60',
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.primary,
  },
  restSection: {
    gap: WolfTheme.spacing.sm,
    marginTop: WolfTheme.spacing.sm,
    paddingLeft: 40,
  },
  restLabel: {
    paddingHorizontal: WolfTheme.spacing.sm,
  },
  restLabelText: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
    fontWeight: '500',
  },
  finalRestSection: {
    gap: WolfTheme.spacing.md,
    paddingTop: WolfTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
  },
  finalRestLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  videoBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(139,92,246,0.1)',
  },
})
