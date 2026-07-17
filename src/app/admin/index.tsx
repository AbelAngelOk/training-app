import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'
import { useAdminOverviewStats } from '@/hooks/use-admin'

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  )
}

export default function AdminOverviewScreen() {
  const { data: stats, isLoading } = useAdminOverviewStats()

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Overview</Text>

      {isLoading || !stats ? (
        <ActivityIndicator size="large" color={WolfTheme.colors.primary} style={styles.loader} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Usuarios por rol</Text>
          <View style={styles.grid}>
            <StatCard label="Gratuitos" value={stats.usersByRole.free_user} />
            <StatCard label="Premium" value={stats.usersByRole.premium_user} />
            <StatCard label="Coaches" value={stats.usersByRole.coach} />
            <StatCard label="Admins" value={stats.usersByRole.admin} />
          </View>

          <Text style={styles.sectionTitle}>Programas por estado</Text>
          <View style={styles.grid}>
            <StatCard label="Borrador" value={stats.programsByStatus.draft} />
            <StatCard label="Publicado" value={stats.programsByStatus.published} />
            <StatCard label="Archivado" value={stats.programsByStatus.archived} />
          </View>

          <Text style={styles.sectionTitle}>Retos por estado</Text>
          <View style={styles.grid}>
            <StatCard label="Borrador" value={stats.challengesByStatus.draft} />
            <StatCard label="Publicado" value={stats.challengesByStatus.published} />
            <StatCard label="Archivado" value={stats.challengesByStatus.archived} />
          </View>

          <Text style={styles.sectionTitle}>Actividad</Text>
          <View style={styles.grid}>
            <StatCard label="Entrenamientos completados (7 días)" value={stats.completedWorkoutsLast7Days} />
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: WolfTheme.spacing.xl,
    gap: WolfTheme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  loader: {
    marginTop: WolfTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: WolfTheme.colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: WolfTheme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WolfTheme.spacing.md,
  },
  card: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    paddingVertical: WolfTheme.spacing.lg,
    paddingHorizontal: WolfTheme.spacing.xl,
    minWidth: 140,
    alignItems: 'center',
    gap: WolfTheme.spacing.xs,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: WolfTheme.colors.primary,
  },
  cardLabel: {
    fontSize: 13,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
  },
})
