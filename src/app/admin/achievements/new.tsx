import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useCreateAchievement } from '@/hooks/use-achievements'
import { AchievementForm } from '@/components/admin/AchievementForm'

export default function NewAchievementScreen() {
  const createAchievement = useCreateAchievement()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo logro</Text>
      </View>

      <AchievementForm
        submitLabel="Crear logro"
        loading={createAchievement.isPending}
        onSubmit={async (payload) => {
          await createAchievement.mutateAsync(payload)
          router.replace('/admin/achievements')
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
