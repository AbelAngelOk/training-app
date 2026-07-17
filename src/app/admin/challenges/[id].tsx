import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useChallenge, useUpdateChallenge } from '@/hooks/use-challenges'
import { ChallengeForm } from '@/components/admin/ChallengeForm'
import { ProgramDaySelector } from '@/components/admin/ProgramDaySelector'

export default function EditChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: challenge, isLoading } = useChallenge(id ?? '')
  const updateChallenge = useUpdateChallenge()

  const assignments = challenge
    ? challenge.program_days.map((d) => ({
        key: d.day_number,
        session: { id: d.training_sessions.id, name: d.training_sessions.name },
      }))
    : []

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar reto</Text>
      </View>

      {isLoading || !challenge ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      ) : (
        <>
          <ChallengeForm
            submitLabel="Guardar cambios"
            loading={updateChallenge.isPending}
            defaultValues={{
              name: challenge.name,
              description: challenge.description ?? '',
              duration_days: String(challenge.duration_days),
              achievement_id: challenge.achievement_id,
              status: challenge.status,
            }}
            onSubmit={async (payload) => {
              await updateChallenge.mutateAsync({ id: id!, ...payload })
              router.replace('/admin/challenges')
            }}
          />

          <View style={styles.daysSection}>
            <Text style={styles.daysTitle}>Días del reto</Text>
            <ProgramDaySelector
              programId={id!}
              scheduleType="day_number"
              durationDays={challenge.duration_days}
              assignments={assignments}
            />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    padding: WolfTheme.spacing.xl,
    paddingBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysSection: {
    padding: WolfTheme.spacing.xl,
    paddingTop: 0,
    maxWidth: 640,
    gap: WolfTheme.spacing.sm,
  },
  daysTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
})
