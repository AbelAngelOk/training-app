import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useMuscleGroups, useUpdateMuscleGroup } from '@/hooks/use-exercises'
import { CatalogItemForm } from '@/components/admin/CatalogItemForm'

export default function EditMuscleGroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: muscleGroups, isLoading } = useMuscleGroups()
  const muscleGroup = muscleGroups?.find((mg) => mg.id === id)
  const updateMuscleGroup = useUpdateMuscleGroup()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar grupo muscular</Text>
      </View>

      {isLoading || !muscleGroup ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      ) : (
        <CatalogItemForm
          itemLabel="el grupo muscular"
          submitLabel="Guardar cambios"
          loading={updateMuscleGroup.isPending}
          defaultValues={{
            name_es: muscleGroup.name_es,
            name_en: muscleGroup.name_en,
            description_es: muscleGroup.description_es ?? '',
            description_en: muscleGroup.description_en ?? '',
          }}
          onSubmit={async (payload) => {
            await updateMuscleGroup.mutateAsync({ id: id!, ...payload })
            router.replace('/admin/muscle-groups')
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
