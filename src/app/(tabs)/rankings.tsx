import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

type RankingType = 'training_hours' | 'weight_lifted'
type RankingScope = 'friends' | 'city' | 'province' | 'country' | 'global'

const RANKING_TYPES: { key: RankingType; label: string }[] = [
  { key: 'training_hours', label: 'Horas' },
  { key: 'weight_lifted', label: 'Peso' },
]

const RANKING_SCOPES: { key: RankingScope; label: string }[] = [
  { key: 'friends', label: 'Amigos' },
  { key: 'city', label: 'Ciudad' },
  { key: 'province', label: 'Provincia' },
  { key: 'country', label: 'País' },
  { key: 'global', label: 'Mundial' },
]

export default function RankingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Rankings</Text>
      </View>

      {/* Scope selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scopeScroll}
        style={styles.scopeContainer}
      >
        {RANKING_SCOPES.map((scope, index) => (
          <TouchableOpacity
            key={scope.key}
            style={[styles.scopeChip, index === 0 && styles.scopeChipActive]}
          >
            <Text style={[styles.scopeText, index === 0 && styles.scopeTextActive]}>
              {scope.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Type selector */}
      <View style={styles.typeSelector}>
        {RANKING_TYPES.map((type, index) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.typeButton, index === 0 && styles.typeButtonActive]}
          >
            <Text style={[styles.typeText, index === 0 && styles.typeTextActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Empty state */}
      <View style={styles.emptyState}>
        <Ionicons
          name="trophy-outline"
          size={48}
          color={WolfTheme.colors.textSecondary}
        />
        <Text style={styles.emptyTitle}>Rankings próximamente</Text>
        <Text style={styles.emptyText}>
          Completá entrenamientos para aparecer en los rankings.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  header: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.md,
    paddingBottom: WolfTheme.spacing.sm,
  },
  title: {
    fontSize: WolfTheme.typography.h2.fontSize,
    fontWeight: WolfTheme.typography.h2.fontWeight,
    color: WolfTheme.colors.textPrimary,
  },
  scopeContainer: {
    maxHeight: 48,
  },
  scopeScroll: {
    paddingHorizontal: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.sm,
    alignItems: 'center',
  },
  scopeChip: {
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.xs,
    borderRadius: 20,
    backgroundColor: WolfTheme.colors.surface,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  scopeChipActive: {
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderColor: WolfTheme.colors.primary,
  },
  scopeText: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
    fontWeight: '500',
  },
  scopeTextActive: {
    color: WolfTheme.colors.primary,
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: WolfTheme.spacing.lg,
    marginTop: WolfTheme.spacing.md,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: WolfTheme.spacing.sm,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeButtonActive: {
    backgroundColor: WolfTheme.colors.surfaceLight,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: WolfTheme.colors.textSecondary,
  },
  typeTextActive: {
    color: WolfTheme.colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.sm,
  },
  emptyTitle: {
    fontSize: WolfTheme.typography.h3.fontSize,
    fontWeight: WolfTheme.typography.h3.fontWeight,
    color: WolfTheme.colors.textPrimary,
    marginTop: WolfTheme.spacing.sm,
  },
  emptyText: {
    fontSize: WolfTheme.typography.caption.fontSize,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
})
