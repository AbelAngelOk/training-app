import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

interface RestTimerProps {
  seconds: number
  onDone?: () => void
}

export function RestTimer({ seconds, onDone }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            onDone?.()
            return 0
          }
          return r - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const handleStart = () => {
    setRemaining(seconds)
    setRunning(true)
  }

  const handleStop = () => {
    clearInterval(intervalRef.current!)
    setRunning(false)
    setRemaining(seconds)
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <View style={styles.container}>
      <View style={styles.timerDisplay}>
        <Ionicons name="timer-outline" size={16} color={WolfTheme.colors.textSecondary} />
        <Text style={styles.timerText}>{mm}:{ss}</Text>
      </View>
      <TouchableOpacity
        style={[styles.btn, running ? styles.btnStop : styles.btnStart]}
        onPress={running ? handleStop : handleStart}
      >
        <Ionicons
          name={running ? 'stop' : 'play'}
          size={14}
          color={running ? WolfTheme.colors.error : WolfTheme.colors.primary}
        />
        <Text style={[styles.btnText, running && styles.btnTextStop]}>
          {running ? 'Detener' : 'Iniciar descanso'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 12,
    padding: WolfTheme.spacing.md,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  btnStart: {
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  btnStop: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.primary,
  },
  btnTextStop: {
    color: WolfTheme.colors.error,
  },
})
