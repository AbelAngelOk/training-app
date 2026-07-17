import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

interface RestCountdownProps {
  /** Epoch ms deadline; the remaining time is derived so it survives remounts */
  endsAt: number
  onDone: () => void
  onSkip: () => void
}

/**
 * Rest countdown between sets/exercises during a guided workout.
 * Unlike RestTimer (manual start/stop), it runs against a fixed deadline.
 */
export function RestCountdown({ endsAt, onDone, onSkip }: RestCountdownProps) {
  const [remainingMs, setRemainingMs] = useState(endsAt - Date.now())
  const doneFired = useRef(false)

  useEffect(() => {
    doneFired.current = false
    setRemainingMs(endsAt - Date.now())
    const interval = setInterval(() => {
      const left = endsAt - Date.now()
      setRemainingMs(left)
      if (left <= 0 && !doneFired.current) {
        doneFired.current = true
        clearInterval(interval)
        onDone()
      }
    }, 500)
    return () => clearInterval(interval)
  }, [endsAt, onDone])

  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const ss = String(totalSeconds % 60).padStart(2, '0')

  return (
    <View style={styles.container}>
      <View style={styles.timerDisplay}>
        <Ionicons name="timer-outline" size={18} color={WolfTheme.colors.primary} />
        <Text style={styles.label}>Descanso</Text>
        <Text style={styles.timerText}>
          {mm}:{ss}
        </Text>
      </View>
      <TouchableOpacity style={styles.skipBtn} onPress={onSkip} hitSlop={8}>
        <Ionicons name="play-skip-forward" size={14} color={WolfTheme.colors.primary} />
        <Text style={styles.skipText}>Saltar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    borderRadius: 12,
    padding: WolfTheme.spacing.md,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.primary,
    fontVariant: ['tabular-nums'],
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.18)',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.primary,
  },
})
