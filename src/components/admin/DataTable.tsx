import { ReactNode } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'

export interface DataTableColumn<T> {
  key: string
  header: string
  width?: number
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  keyExtractor: (row: T) => string
  isLoading?: boolean
  emptyLabel?: string
  renderActions?: (row: T) => ReactNode
}

/**
 * Generic desktop data table for the admin portal. Plain Views/Text, no grid
 * library — horizontal scroll for wide content, sticky-ish header row.
 */
export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  isLoading,
  emptyLabel = 'Sin resultados',
  renderActions,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
      </View>
    )
  }

  if (rows.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    )
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.headerRow}>
          {columns.map((col) => (
            <View key={col.key} style={[styles.cell, { width: col.width ?? 160 }]}>
              <Text style={styles.headerText}>{col.header}</Text>
            </View>
          ))}
          {renderActions && (
            <View style={[styles.cell, styles.actionsCell]}>
              <Text style={styles.headerText}>Acciones</Text>
            </View>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
          {rows.map((row) => (
            <View key={keyExtractor(row)} style={styles.row}>
              {columns.map((col) => {
                const content = col.render(row)
                return (
                  <View key={col.key} style={[styles.cell, { width: col.width ?? 160 }]}>
                    {typeof content === 'string' ? (
                      <Text style={styles.cellText} numberOfLines={2}>
                        {content}
                      </Text>
                    ) : (
                      content
                    )}
                  </View>
                )
              })}
              {renderActions && (
                <View style={[styles.cell, styles.actionsCell]}>{renderActions(row)}</View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: {
    padding: WolfTheme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
    backgroundColor: WolfTheme.colors.surface,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: WolfTheme.colors.border,
  },
  body: {
    maxHeight: 560,
  },
  cell: {
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.sm,
    justifyContent: 'center',
  },
  actionsCell: {
    width: 160,
    flexDirection: 'row',
    gap: WolfTheme.spacing.sm,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: WolfTheme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  cellText: {
    fontSize: 14,
    color: WolfTheme.colors.textPrimary,
  },
})
