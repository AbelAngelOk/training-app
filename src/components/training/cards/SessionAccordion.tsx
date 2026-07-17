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
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { VideoThumbnail } from '@/components/training/shared/VideoThumbnail'
import type { Session } from '@/types/training'

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true)
}

interface SessionAccordionProps {
  session: Session
}

export function SessionAccordion({ session }: SessionAccordionProps) {
  const [open, setOpen] = useState(false)
  const rotate = useRef(new Animated.Value(0)).current

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

  const exerciseCount = session.exerciseCount ?? session.exercises.length

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.8}>
        <Ionicons name={session.icon as any} size={20} color={WolfTheme.colors.primary} />

        <View style={styles.headerContent}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionMeta}>{exerciseCount} ejercicios</Text>
        </View>

        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Ionicons name="chevron-down" size={20} color={WolfTheme.colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>

      {/* Body */}
      {open && (
        <View style={styles.body}>
          {session.exercises.map((exercise, index) => (
            <View key={exercise.id}>
              <View style={styles.exerciseItem}>
                <VideoThumbnail size="sm" />
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.targetSets} series × {exercise.targetReps} repeticiones
                  </Text>
                </View>
              </View>
              {index < session.exercises.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
    minHeight: 56,
  },
  headerContent: {
    flex: 1,
    gap: 2,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  sessionMeta: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  exerciseItem: {
    gap: WolfTheme.spacing.sm,
  },
  exerciseInfo: {
    gap: 2,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  exerciseMeta: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: WolfTheme.colors.border,
    marginTop: WolfTheme.spacing.md,
  },
})
