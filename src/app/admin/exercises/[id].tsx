import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useExercise, useUpdateExercise } from '@/hooks/use-exercises'
import { ExerciseForm } from '@/components/admin/ExerciseForm'

export default function EditExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: exercise, isLoading } = useExercise(id ?? '')
  const updateExercise = useUpdateExercise()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar ejercicio</Text>
      </View>

      {isLoading || !exercise ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      ) : (
        <ExerciseForm
          submitLabel="Guardar cambios"
          loading={updateExercise.isPending}
          defaultValues={{
            name: exercise.name,
            description: exercise.description ?? '',
            instructions: exercise.instructions ?? '',
            tips: exercise.tips ?? '',
            image_url: exercise.image_url ?? '',
            external_id: exercise.external_id ?? '',
            muscle_group_id: exercise.muscle_group_id,
            equipment_id: exercise.equipment_id ?? undefined,
            difficulty: exercise.difficulty,
          }}
          onSubmit={async (payload) => {
            await updateExercise.mutateAsync({ id: id!, ...payload })
            router.replace('/admin/exercises')
          }}
        />
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
})
