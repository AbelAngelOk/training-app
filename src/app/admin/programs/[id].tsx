import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useProgram, useUpdateOfficialProgram } from '@/hooks/use-programs'
import { ProgramForm } from '@/components/admin/ProgramForm'
import { ProgramDaySelector } from '@/components/admin/ProgramDaySelector'

export default function EditProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: program, isLoading } = useProgram(id ?? '')
  const updateProgram = useUpdateOfficialProgram()

  const assignments = program
    ? program.program_days
        .filter((d) => d.weekday)
        .map((d) => ({
          key: d.weekday!,
          session: { id: d.training_sessions.id, name: d.training_sessions.name },
        }))
    : []

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar programa</Text>
      </View>

      {isLoading || !program ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      ) : (
        <>
          <ProgramForm
            submitLabel="Guardar cambios"
            loading={updateProgram.isPending}
            defaultValues={{
              name: program.name,
              description: program.description ?? '',
              status: program.status,
            }}
            onSubmit={async (payload) => {
              await updateProgram.mutateAsync({ id: id!, ...payload })
              router.replace('/admin/programs')
            }}
          />

          <View style={styles.daysSection}>
            <Text style={styles.daysTitle}>Días del programa</Text>
            <ProgramDaySelector programId={id!} scheduleType="weekday" assignments={assignments} />
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
