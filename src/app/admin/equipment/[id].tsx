import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useEquipment, useUpdateEquipment } from '@/hooks/use-exercises'
import { CatalogItemForm } from '@/components/admin/CatalogItemForm'

export default function EditEquipmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: equipment, isLoading } = useEquipment()
  const item = equipment?.find((eq) => eq.id === id)
  const updateEquipment = useUpdateEquipment()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar equipo</Text>
      </View>

      {isLoading || !item ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      ) : (
        <CatalogItemForm
          itemLabel="el equipo"
          submitLabel="Guardar cambios"
          loading={updateEquipment.isPending}
          defaultValues={{
            name_es: item.name_es,
            name_en: item.name_en,
            description_es: item.description_es ?? '',
            description_en: item.description_en ?? '',
          }}
          onSubmit={async (payload) => {
            await updateEquipment.mutateAsync({ id: id!, ...payload })
            router.replace('/admin/equipment')
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
