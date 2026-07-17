import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useInfinitePrograms } from '@/hooks/use-programs'
import { SearchInput } from '@/components/training/shared/SearchInput'
import { ProgramCard } from '@/components/explore/ProgramCard'
import { ProgramCardSkeleton } from '@/components/training/skeletons/ProgramCardSkeleton'
import type { WorkoutProgramRow } from '@/types/database'

export default function ExploreProgramsScreen() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

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
  } = useInfinitePrograms(debouncedQuery)

  const programs = useMemo<WorkoutProgramRow[]>(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Programas</Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar programas..."
        />
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <ProgramCardSkeleton key={i} />
            ))}
        </View>
      ) : programs.length === 0 ? (
        <View testID="explore-programs-empty-state" style={styles.emptyState}>
          <Ionicons name="compass-outline" size={48} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>
            {debouncedQuery ? 'Sin resultados' : 'Sin programas disponibles'}
          </Text>
          <Text style={styles.emptyText}>
            {debouncedQuery
              ? 'Probá con otro término de búsqueda.'
              : 'Los programas oficiales estarán disponibles próximamente.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={programs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={() => hasNextPage && fetchNextPage()}
          renderItem={({ item }) => (
            <ProgramCard
              program={item}
              onPress={() => router.push(`/(tabs)/explore/${item.id}`)}
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
    paddingBottom: WolfTheme.spacing.md,
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
