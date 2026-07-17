import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useCreateExercise } from '@/hooks/use-exercises'
import { ExerciseForm } from '@/components/admin/ExerciseForm'

export default function NewExerciseScreen() {
  const createExercise = useCreateExercise()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo ejercicio</Text>
      </View>

      <ExerciseForm
        submitLabel="Crear ejercicio"
        loading={createExercise.isPending}
        onSubmit={async (payload) => {
          await createExercise.mutateAsync(payload)
          router.replace('/admin/exercises')
        }}
      />
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
})
