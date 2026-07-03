import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useOfficialPrograms } from '@/hooks/use-programs'
import { useAssignProgram } from '@/hooks/use-programs'
import type { WorkoutProgramRow } from '@/types/database'

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

function ProgramCard({
  program,
  onAssign,
  isAssigning,
}: {
  program: WorkoutProgramRow
  onAssign: (id: string) => void
  isAssigning: boolean
}) {
  return (
    <View testID="explore-program-card" style={styles.card}>
      <View style={styles.cardHeader}>
        <Text testID="explore-program-card-name" style={styles.cardName}>{program.name}</Text>
      </View>
      {program.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {program.description}
        </Text>
      )}
      <TouchableOpacity
        testID="explore-program-card-assign-button"
        style={[styles.assignButton, isAssigning && styles.buttonDisabled]}
        onPress={() => onAssign(program.id)}
        disabled={isAssigning}
      >
        {isAssigning ? (
          <ActivityIndicator size="small" color={WolfTheme.colors.background} />
        ) : (
          <Text style={styles.assignButtonText}>Usar programa</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default function ExploreScreen() {
  const [query, setQuery] = useState('')
  const { data: programs, isLoading } = useOfficialPrograms()
  const { mutateAsync: assignProgram, isPending: isAssigning, variables: assigningId } = useAssignProgram()

  const filtered = (programs ?? []).filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleAssign = async (programId: string) => {
    try {
      await assignProgram(programId)
      Alert.alert('¡Listo!', 'Programa asignado correctamente. Podés verlo en tu pantalla de entrenamiento.')
    } catch {
      Alert.alert('Error', 'No se pudo asignar el programa. Intentá nuevamente.')
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={WolfTheme.colors.textSecondary} />
          <TextInput
            testID="explore-search-input"
            style={styles.searchInput}
            placeholder="Buscar programas..."
            placeholderTextColor={WolfTheme.colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={WolfTheme.colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View testID="explore-empty-state" style={styles.emptyState}>
          <Ionicons name="compass-outline" size={48} color={WolfTheme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>
            {query ? 'Sin resultados' : 'Sin programas disponibles'}
          </Text>
          <Text style={styles.emptyText}>
            {query
              ? 'Probá con otro término de búsqueda.'
              : 'Los programas oficiales estarán disponibles próximamente.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProgramCard
              program={item}
              onAssign={handleAssign}
              isAssigning={isAssigning && assigningId === item.id}
            />
          )}
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
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingTop: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  title: {
    fontSize: WolfTheme.typography.h2.fontSize,
    fontWeight: WolfTheme.typography.h2.fontWeight,
    color: WolfTheme.colors.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    paddingHorizontal: WolfTheme.spacing.md,
    height: 48,
    gap: WolfTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: WolfTheme.colors.textPrimary,
    fontSize: 15,
  },
  list: {
    padding: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.md,
  },
  card: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.lg,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    gap: WolfTheme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    fontSize: WolfTheme.typography.h3.fontSize,
    fontWeight: WolfTheme.typography.h3.fontWeight,
    color: WolfTheme.colors.textPrimary,
    flex: 1,
  },
  cardDescription: {
    fontSize: WolfTheme.typography.caption.fontSize,
    color: WolfTheme.colors.textSecondary,
    lineHeight: 20,
  },
  assignButton: {
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  assignButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
