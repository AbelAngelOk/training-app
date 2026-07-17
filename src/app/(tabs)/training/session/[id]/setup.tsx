import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'

import { WolfTheme } from '@/constants/colors'
import { useSession, useUpdateSessionExercise } from '@/hooks/use-sessions'
import { markSessionTargetsConfigured } from '@/api/sessions'
import { QUERY_KEYS } from '@/constants/query-keys'
import { RestSetupCard } from '@/components/training/execution/RestSetupCard'
import { ExerciseSetupCard, type SetupValues } from '@/components/training/execution/ExerciseSetupCard'
import { toNumberOrNull } from '@/components/training/execution/ExerciseTargetCard'
import { PrimaryButton } from '@/components/training/shared/PrimaryButton'
import { AlertModal } from '@/components/ui/AlertModal'

const DEFAULT_REST_SECONDS = 60

export default function SessionSetupScreen() {
  const { id, programId } = useLocalSearchParams<{ id: string; programId?: string }>()
  const { data: session, isLoading } = useSession(id ?? '')
  const updateExercise = useUpdateSessionExercise(id ?? '')
  const queryClient = useQueryClient()

  const [step, setStep] = useState(0)
  const [restSeconds, setRestSeconds] = useState(DEFAULT_REST_SECONDS)
  const [values, setValues] = useState<Record<string, SetupValues>>({})
  const [saving, setSaving] = useState(false)
  const [errorAlert, setErrorAlert] = useState<string | null>(null)

  const sessionExercises = useMemo(
    () => [...(session?.session_exercises ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [session]
  )

  const initializedRef = useRef(false)
  useEffect(() => {
    if (initializedRef.current || sessionExercises.length === 0) return

    const initialValues: Record<string, SetupValues> = {}
    for (const se of sessionExercises) {
      initialValues[se.id] = {
        sets: String(se.target_sets ?? ''),
        reps: String(se.target_reps ?? ''),
        weight: String(se.target_weight ?? ''),
      }
    }
    setValues(initialValues)
    setRestSeconds(sessionExercises[0].rest_seconds ?? DEFAULT_REST_SECONDS)
    initializedRef.current = true
  }, [sessionExercises])

  // Safety net: this wizard is only reachable for editable (personal) sessions
  useEffect(() => {
    if (!isLoading && session && session.type !== 'personal') {
      router.replace(`/(tabs)/training/session/${id}?programId=${programId ?? ''}`)
    }
  }, [isLoading, session, id, programId])

  const totalSteps = sessionExercises.length + 1
  const isLastStep = step === totalSteps - 1
  const isRestStep = step === 0

  const handleValueChange = (sessionExerciseId: string, field: keyof SetupValues, value: string) => {
    setValues((prev) => ({
      ...prev,
      [sessionExerciseId]: { ...prev[sessionExerciseId], [field]: value },
    }))
  }

  const handleNext = async () => {
    if (!isLastStep) {
      setStep((s) => s + 1)
      return
    }

    setSaving(true)
    try {
      await Promise.all([
        ...sessionExercises.map((se) => {
          const v = values[se.id]
          return updateExercise.mutateAsync({
            id: se.id,
            target_sets: toNumberOrNull(v?.sets ?? ''),
            target_reps: toNumberOrNull(v?.reps ?? ''),
            target_weight: toNumberOrNull(v?.weight ?? ''),
            rest_seconds: restSeconds,
          })
        }),
        markSessionTargetsConfigured(id ?? ''),
      ])
      // Await the refetch so the destination screen doesn't mount with the
      // stale cached session (targets_configured_at still null), which would
      // otherwise redirect straight back into this wizard.
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SESSION(id ?? '') })
      router.replace(`/(tabs)/training/session/${id}?programId=${programId ?? ''}`)
    } catch (err) {
      setErrorAlert(
        err instanceof Error ? err.message : 'No se pudieron guardar los objetivos. Intentá de nuevo.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (step === 0) {
      router.back()
      return
    }
    setStep((s) => s - 1)
  }

  if (isLoading || sessionExercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  const currentExercise = !isRestStep ? sessionExercises[step - 1] : null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.dots}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {isRestStep ? (
        <RestSetupCard seconds={restSeconds} onChangeSeconds={setRestSeconds} />
      ) : (
        currentExercise && (
          <ExerciseSetupCard
            sessionExercise={currentExercise}
            index={step - 1}
            total={sessionExercises.length}
            values={
              values[currentExercise.id] ?? { sets: '', reps: '', weight: '' }
            }
            onChange={(field, value) => handleValueChange(currentExercise.id, field, value)}
          />
        )
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          label={isLastStep ? 'Guardar y comenzar' : 'Siguiente'}
          onPress={handleNext}
          loading={saving}
          size="lg"
        />
      </View>

      <AlertModal
        visible={!!errorAlert}
        title="Error"
        message={errorAlert ?? ''}
        type="error"
        onDismiss={() => setErrorAlert(null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: WolfTheme.colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: WolfTheme.colors.primary,
    width: 9,
    height: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.lg,
    backgroundColor: WolfTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
  },
})
