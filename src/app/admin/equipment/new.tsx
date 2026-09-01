import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useCreateEquipment } from '@/hooks/use-exercises'
import { CatalogItemForm } from '@/components/admin/CatalogItemForm'

export default function NewEquipmentScreen() {
  const createEquipment = useCreateEquipment()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo equipo</Text>
      </View>

      <CatalogItemForm
        itemLabel="el equipo"
        submitLabel="Crear equipo"
        loading={createEquipment.isPending}
        onSubmit={async (payload) => {
          await createEquipment.mutateAsync(payload)
          router.replace('/admin/equipment')
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
