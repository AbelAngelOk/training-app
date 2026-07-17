import type { ReactElement } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

const CAROUSEL_LIMIT = 6

interface SectionCarouselProps<T> {
  title: string
  items: T[]
  keyExtractor: (item: T) => string
  renderItem: (item: T) => ReactElement
  onViewAll: () => void
  emptyLabel?: string
  testIDPrefix?: string
}

/**
 * Horizontal carousel with a title and "Ver todo" action, capped at 6 items.
 * Used by Explore's "Programas" and "Retos" sections.
 */
export function SectionCarousel<T>({
  title,
  items,
  keyExtractor,
  renderItem,
  onViewAll,
  emptyLabel,
  testIDPrefix,
}: SectionCarouselProps<T>) {
  const visibleItems = items.slice(0, CAROUSEL_LIMIT)

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          testID={testIDPrefix ? `${testIDPrefix}-view-all-button` : undefined}
          style={styles.viewAllBtn}
          onPress={onViewAll}
          hitSlop={8}
        >
          <Text style={styles.viewAllText}>Ver todo</Text>
          <Ionicons name="chevron-forward" size={14} color={WolfTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      {visibleItems.length === 0 ? (
        <Text style={styles.emptyText}>{emptyLabel ?? 'Nada disponible por ahora.'}</Text>
      ) : (
        <FlatList
          horizontal
          data={visibleItems}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => renderItem(item)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: WolfTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: WolfTheme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.primary,
  },
  list: {
    paddingHorizontal: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.md,
  },
  emptyText: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    paddingHorizontal: WolfTheme.spacing.lg,
  },
})
