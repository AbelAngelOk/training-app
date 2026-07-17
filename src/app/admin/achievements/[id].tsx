import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useAchievements, useUpdateAchievement } from '@/hooks/use-achievements'
import { AchievementForm } from '@/components/admin/AchievementForm'

export default function EditAchievementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: achievements, isLoading } = useAchievements()
  const achievement = achievements?.find((a) => a.id === id)
  const updateAchievement = useUpdateAchievement()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar logro</Text>
      </View>

      {isLoading || !achievement ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
        </View>
      ) : (
        <AchievementForm
          submitLabel="Guardar cambios"
          loading={updateAchievement.isPending}
          defaultValues={{
            code: achievement.code,
            name: achievement.name,
            description: achievement.description ?? '',
          }}
          onSubmit={async (payload) => {
            await updateAchievement.mutateAsync({ id: id!, ...payload })
            router.replace('/admin/achievements')
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
