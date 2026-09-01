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
            name_es: exercise.name_es,
            name_en: exercise.name_en,
            description_es: exercise.description_es ?? '',
            description_en: exercise.description_en ?? '',
            instructions_es: exercise.instructions_es ?? '',
            instructions_en: exercise.instructions_en ?? '',
            tips_es: exercise.tips_es ?? '',
            tips_en: exercise.tips_en ?? '',
            image_url: exercise.image_url ?? '',
            external_id: exercise.external_id ?? '',
            fitgifs_slug: exercise.fitgifs_slug ?? '',
            muscle_group_ids: exercise.muscle_groups.map((mg) => mg.id),
            equipment_ids: exercise.equipment.map((eq) => eq.id),
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
