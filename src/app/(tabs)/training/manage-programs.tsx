import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import {
  useSetUserProgramActive,
  useUserProgramAssignments,
} from '@/hooks/use-programs'
import { useProgramLimits } from '@/hooks/use-program-limits'
import { ProgramLimitError, type UserProgramAssignment } from '@/api/programs'
import { AlertModal } from '@/components/ui/AlertModal'
import { ProgramCardSkeleton } from '@/components/training/skeletons/ProgramCardSkeleton'

const TYPE_LABEL: Record<string, string> = {
  official: 'Oficial',
  personal: 'Personal',
  challenge: 'Reto',
}

interface AssignmentRowProps {
  assignment: UserProgramAssignment
  busy: boolean
  onToggle: (assignment: UserProgramAssignment) => void
}

function AssignmentRow({ assignment, busy, onToggle }: AssignmentRowProps) {
  const program = assignment.workout_programs
  const isActive = assignment.is_active
  const isChallenge = program.type === 'challenge'

  return (
    <View style={[styles.row, !isActive && styles.rowInactive]}>
      <TouchableOpacity
        style={styles.rowMain}
        activeOpacity={0.8}
        onPress={() => router.push(`/(tabs)/training/${program.id}`)}
      >
        <View
          style={[
            styles.rowIcon,
            isActive && isChallenge && styles.rowIconChallenge,
            !isActive && styles.rowIconInactive,
          ]}
        >
          <Ionicons
            name={isChallenge ? 'flame-outline' : 'barbell-outline'}
            size={20}
            color={
              isActive
                ? isChallenge
                  ? WolfTheme.colors.warning
                  : WolfTheme.colors.primary
                : WolfTheme.colors.textSecondary
            }
          />
        </View>
        <View style={styles.rowMeta}>
          <Text style={styles.rowName} numberOfLines={1}>
            {program.name}
          </Text>
          <Text style={styles.rowSub}>
            {TYPE_LABEL[program.type] ?? program.type}
            {assignment.deactivated_at && !isActive
              ? ` · desactivado el ${new Date(assignment.deactivated_at).toLocaleDateString()}`
              : ''}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.toggleBtn, isActive ? styles.toggleBtnDeactivate : styles.toggleBtnActivate]}
        onPress={() => onToggle(assignment)}
        disabled={busy}
        hitSlop={4}
      >
        <Text
          style={[
            styles.toggleText,
            isActive ? styles.toggleTextDeactivate : styles.toggleTextActivate,
          ]}
        >
          {isActive ? 'Desactivar' : 'Activar'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default function ManageProgramsScreen() {
  const { data: assignments, isLoading } = useUserProgramAssignments()
  const setActive = useSetUserProgramActive()
  const { activeCount, maxAllowed, isPremium } = useProgramLimits('program')

  const [alert, setAlert] = useState<{ title: string; message: string; type: 'error' | 'info' } | null>(
    null
  )

  const { active, inactive } = useMemo(() => {
    const all = assignments ?? []
    return {
      active: all.filter((a) => a.is_active),
      inactive: all.filter((a) => !a.is_active),
    }
  }, [assignments])

  const handleToggle = async (assignment: UserProgramAssignment) => {
    try {
      await setActive.mutateAsync({
        userProgramId: assignment.id,
        active: !assignment.is_active,
      })
    } catch (err) {
      if (err instanceof ProgramLimitError) {
        setAlert({
          type: 'error',
          title: 'Límite de programas alcanzado',
          message: isPremium
            ? `Tu plan premium permite hasta ${maxAllowed} programas activos. Desactivá otro programa para activar este.`
            : 'Tu plan free permite 1 programa activo. Desactivá el actual para activar este, o pasate a premium para tener hasta 3.',
        })
      } else {
        setAlert({
          type: 'error',
          title: 'Error',
          message: 'No se pudo actualizar el programa. Intentá de nuevo.',
        })
      }
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={WolfTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.title}>Mis programas</Text>
          <Text style={styles.subtitle}>
            {activeCount}/{maxAllowed} activos · plan {isPremium ? 'premium' : 'free'}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <ProgramCardSkeleton key={i} />
            ))}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Activos</Text>
          {active.length === 0 ? (
            <Text style={styles.emptyText}>No tenés programas activos.</Text>
          ) : (
            active.map((a) => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                busy={setActive.isPending}
                onToggle={handleToggle}
              />
            ))
          )}

          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Desactivados</Text>
          {inactive.length === 0 ? (
            <Text style={styles.emptyText}>No tenés programas desactivados.</Text>
          ) : (
            inactive.map((a) => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                busy={setActive.isPending}
                onToggle={handleToggle}
              />
            ))
          )}

          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={18} color={WolfTheme.colors.textSecondary} />
            <Text style={styles.hintText}>
              Los programas desactivados conservan todo su historial de entrenamientos. Podés
              reactivarlos cuando quieras mientras tengas cupo en tu plan.
            </Text>
          </View>
        </ScrollView>
      )}

      <AlertModal
        visible={!!alert}
        title={alert?.title ?? ''}
        message={alert?.message ?? ''}
        type={alert?.type ?? 'info'}
        onDismiss={() => setAlert(null)}
      />
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
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
  },
  skeletons: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingVertical: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  scroll: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingBottom: WolfTheme.spacing.xxl,
    gap: WolfTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  sectionTitleSpaced: {
    marginTop: WolfTheme.spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
    gap: WolfTheme.spacing.md,
  },
  rowInactive: {
    opacity: 0.75,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: WolfTheme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconInactive: {
    backgroundColor: WolfTheme.colors.surfaceLight,
  },
  rowIconChallenge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  rowMeta: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  rowSub: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnDeactivate: {
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  toggleBtnActivate: {
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextDeactivate: {
    color: WolfTheme.colors.error,
  },
  toggleTextActivate: {
    color: WolfTheme.colors.primary,
  },
  hintBox: {
    flexDirection: 'row',
    gap: WolfTheme.spacing.sm,
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    padding: WolfTheme.spacing.md,
    marginTop: WolfTheme.spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    lineHeight: 18,
  },
})
