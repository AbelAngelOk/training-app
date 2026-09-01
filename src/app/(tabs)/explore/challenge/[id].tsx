import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useAssignChallenge, useChallenge } from '@/hooks/use-challenges'
import { useProgramLimits } from '@/hooks/use-program-limits'
import { useAppLanguage } from '@/hooks/use-app-language'
import { getLocalizedText } from '@/lib/i18n'
import { ProgramLimitError } from '@/api/programs'
import { AlertModal } from '@/components/ui/AlertModal'
import { ProgramDetailSkeleton } from '@/components/training/skeletons/ProgramDetailSkeleton'

const CHALLENGE_COLOR = WolfTheme.colors.warning

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const language = useAppLanguage()
  const { data: challenge, isLoading } = useChallenge(id || '')
  const { mutateAsync: assignChallenge, isPending: isAssigning } = useAssignChallenge()
  const { canActivate, maxAllowed, isPremium } = useProgramLimits('challenge')

  const [alertModal, setAlertModal] = useState<{
    visible: boolean
    type: 'success' | 'error'
    title: string
    message: string
    ctaLabel?: string
    onCta?: () => void
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  })

  const showLimitAlert = () => {
    setAlertModal({
      visible: true,
      type: 'error',
      title: 'Límite de retos alcanzado',
      message: isPremium
        ? `Tu plan premium permite hasta ${maxAllowed} retos activos. Desactivá uno desde "Mis programas" para empezar este.`
        : 'Tu plan free permite 1 reto activo. Desactivá el actual desde "Mis programas" para empezar este, o pasate a premium para tener hasta 3.',
      ctaLabel: 'Ir a Mis programas',
      onCta: () => {
        setAlertModal((prev) => ({ ...prev, visible: false }))
        router.push('/(tabs)/training/manage-programs')
      },
    })
  }

  const handleStart = async () => {
    if (!id) return
    if (!canActivate) {
      showLimitAlert()
      return
    }
    try {
      await assignChallenge(id)
      setAlertModal({
        visible: true,
        type: 'success',
        title: '¡A entrenar!',
        message: 'Reto iniciado. Encontralo en tu pantalla de entrenamiento.',
      })
      setTimeout(() => {
        // Reset the explore stack back to its index first — otherwise the
        // next time the user taps the "Explorar" tab, it resumes right here
        // (this challenge's detail screen) instead of showing the explore list.
        router.dismissAll()
        router.replace('/(tabs)/training')
      }, 1500)
    } catch (error) {
      if (error instanceof ProgramLimitError) {
        showLimitAlert()
        return
      }
      setAlertModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo iniciar el reto. Intentá nuevamente.',
      })
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ProgramDetailSkeleton />
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Reto no encontrado</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <>
      <AlertModal
        visible={alertModal.visible}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        buttonLabel={alertModal.ctaLabel}
        onConfirm={alertModal.onCta}
        onDismiss={() => setAlertModal((prev) => ({ ...prev, visible: false }))}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerMeta}>
            <View style={styles.iconDot}>
              <Ionicons name="flame-outline" size={14} color={CHALLENGE_COLOR} />
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {challenge.name}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{challenge.duration_days}</Text>
            <Text style={styles.statLabel}>Días</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{challenge.program_days.length}</Text>
            <Text style={styles.statLabel}>Sesiones</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {challenge.description && (
            <Text style={styles.description}>{challenge.description}</Text>
          )}

          {challenge.achievements && (
            <View style={styles.achievementCard}>
              <Ionicons name="trophy" size={28} color={CHALLENGE_COLOR} />
              <View style={styles.achievementMeta}>
                <Text style={styles.achievementLabel}>Logro al completar</Text>
                <Text style={styles.achievementName}>{challenge.achievements.name}</Text>
                {challenge.achievements.description && (
                  <Text style={styles.achievementDescription}>
                    {challenge.achievements.description}
                  </Text>
                )}
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Días del reto</Text>
          <View style={styles.daysList}>
            {challenge.program_days.map((day) => {
              const session = day.training_sessions
              const exercise = session.session_exercises[0]
              return (
                <View key={day.day_number} style={styles.dayRow}>
                  <View style={styles.dayNumberBox}>
                    <Text style={styles.dayNumberText}>{day.day_number}</Text>
                  </View>
                  <View style={styles.dayMeta}>
                    <Text style={styles.dayName}>{session.name}</Text>
                    {exercise && (
                      <Text style={styles.dayDetail}>
                        {getLocalizedText(exercise.exercises.name_es, exercise.exercises.name_en, language)} —{' '}
                        {exercise.target_sets}×{exercise.target_reps}
                      </Text>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>

        {/* Start button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.startButton, isAssigning && styles.buttonDisabled]}
            onPress={handleStart}
            disabled={isAssigning}
          >
            <Text style={styles.startButtonText}>
              {isAssigning ? 'Suscribiendo...' : 'Suscribirme al reto'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
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
    gap: WolfTheme.spacing.md,
  },
  notFound: {
    color: WolfTheme.colors.textPrimary,
    fontSize: 18,
  },
  backLink: {
    color: WolfTheme.colors.primary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  iconDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    flex: 1,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: WolfTheme.colors.surface,
    marginHorizontal: WolfTheme.spacing.lg,
    marginBottom: WolfTheme.spacing.md,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    paddingVertical: WolfTheme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: WolfTheme.colors.border,
  },
  scroll: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingBottom: 100,
    gap: WolfTheme.spacing.lg,
  },
  description: {
    fontSize: 15,
    color: WolfTheme.colors.textSecondary,
    lineHeight: 22,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
  },
  achievementMeta: {
    flex: 1,
    gap: 2,
  },
  achievementLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: CHALLENGE_COLOR,
    textTransform: 'uppercase',
  },
  achievementName: {
    fontSize: 15,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  achievementDescription: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  daysList: {
    gap: WolfTheme.spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
  },
  dayNumberBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: CHALLENGE_COLOR,
  },
  dayMeta: {
    flex: 1,
    gap: 2,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  dayDetail: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WolfTheme.colors.background,
    borderTopWidth: 1,
    borderTopColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.xl,
  },
  startButton: {
    backgroundColor: CHALLENGE_COLOR,
    borderRadius: WolfTheme.radius.button,
    paddingVertical: WolfTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
  },
})
