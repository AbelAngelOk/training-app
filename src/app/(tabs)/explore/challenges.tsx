import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useInfiniteChallenges } from '@/hooks/use-challenges'
import { SearchInput } from '@/components/training/shared/SearchInput'
import { ChallengeCard } from '@/components/explore/ChallengeCard'
import { ProgramCardSkeleton } from '@/components/training/skeletons/ProgramCardSkeleton'
import type { ChallengeRow } from '@/api/challenges'

type DurationFilter = 'all' | 'short' | 'long'

const FILTERS: { key: DurationFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'short', label: 'Hasta 14 días' },
  { key: 'long', label: '15+ días' },
]

export default function ExploreChallengesScreen() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteChallenges(debouncedQuery)

  const challenges = useMemo<ChallengeRow[]>(() => {
    const all = data?.pages.flatMap((page) => page.items) ?? []
    if (durationFilter === 'short') return all.filter((c) => c.duration_days <= 14)
    if (durationFilter === 'long') return all.filter((c) => c.duration_days >= 15)
    return all
  }, [data, durationFilter])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Retos</Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar retos..." />
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterChip, durationFilter === filter.key && styles.filterChipActive]}
            onPress={() => setDurationFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                durationFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <ProgramCardSkeleton key={i} />
            ))}
        </View>
      ) : challenges.length === 0 ? (
        <View testID="explore-challenges-empty-state" style={styles.emptyState}>
          <Ionicons name="flame-outline" size={48} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>
            {debouncedQuery || durationFilter !== 'all' ? 'Sin resultados' : 'Sin retos disponibles'}
          </Text>
          <Text style={styles.emptyText}>
            {debouncedQuery || durationFilter !== 'all'
              ? 'Probá con otro término o filtro.'
              : 'Los retos estarán disponibles próximamente.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={() => hasNextPage && fetchNextPage()}
          renderItem={({ item }) => (
            <ChallengeCard
              challenge={item}
              onPress={() => router.push(`/(tabs)/explore/challenge/${item.id}`)}
            />
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                style={styles.footerLoader}
                size="small"
                color={WolfTheme.colors.primary}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  searchWrap: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.sm,
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: WolfTheme.colors.surfaceLight,
  },
  filterChipActive: {
    backgroundColor: 'rgba(245,158,11,0.18)',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  filterTextActive: {
    color: WolfTheme.colors.warning,
  },
  skeletons: {
    paddingHorizontal: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.md,
  },
  list: {
    padding: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.md,
  },
  footerLoader: {
    paddingVertical: WolfTheme.spacing.lg,
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
