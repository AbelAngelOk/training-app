import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { useActiveSubscription, useSubscriptionPlans } from '@/hooks/use-subscriptions'

export default function SubscriptionScreen() {
  const { data: subscription, isLoading: loadingSubscription } = useActiveSubscription()
  const { data: plans, isLoading: loadingPlans } = useSubscriptionPlans()

  const isLoading = loadingSubscription || loadingPlans

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator color={WolfTheme.colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {subscription ? (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <Ionicons name="star" size={32} color={WolfTheme.colors.warning} />
              <Text style={styles.activeTitle}>Premium activo</Text>
            </View>
            <View style={styles.activeDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Plan</Text>
                <Text style={styles.detailValue}>
                  {(subscription as any).subscription_plans?.name ?? '—'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estado</Text>
                <Text style={[styles.detailValue, { color: WolfTheme.colors.success }]}>
                  {subscription.status === 'active' ? 'Activo' : 'Período de gracia'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vence el</Text>
                <Text style={styles.detailValue}>
                  {new Date(subscription.expires_at).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.noPremiumHeader}>
              <Ionicons name="star-outline" size={48} color={WolfTheme.colors.warning} />
              <Text style={styles.noPremiumTitle}>Desbloqueá Premium</Text>
              <Text style={styles.noPremiumText}>
                Participá en rankings globales y accedé a funciones exclusivas.
              </Text>
            </View>

            <View style={styles.benefitsList}>
              {[
                'Rankings por ciudad, provincia y país',
                'Creación de programas personalizados',
                'Estadísticas avanzadas',
              ].map((benefit) => (
                <View key={benefit} style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color={WolfTheme.colors.success} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.plansSection}>
              <Text style={styles.plansTitle}>Elegí tu plan</Text>
              {(plans ?? []).map((plan) => (
                <View key={plan.id} style={styles.planCard}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDuration}>
                      {plan.duration_months === 1 ? '1 mes' : `${plan.duration_months} meses`}
                    </Text>
                  </View>
                  <Text style={styles.planPrice}>${plan.price}</Text>
                </View>
              ))}
              <Text style={styles.comingSoon}>Pagos disponibles próximamente</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.lg,
  },
  activeCard: {
    backgroundColor: 'rgba(242,186,98,0.1)',
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.lg,
    borderWidth: 1,
    borderColor: WolfTheme.colors.warning,
    gap: WolfTheme.spacing.lg,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
  },
  activeTitle: {
    fontSize: WolfTheme.typography.h2.fontSize,
    fontWeight: WolfTheme.typography.h2.fontWeight,
    color: WolfTheme.colors.warning,
  },
  activeDetails: {
    gap: WolfTheme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  noPremiumHeader: {
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    paddingTop: WolfTheme.spacing.lg,
  },
  noPremiumTitle: {
    fontSize: WolfTheme.typography.h2.fontSize,
    fontWeight: WolfTheme.typography.h2.fontWeight,
    color: WolfTheme.colors.textPrimary,
  },
  noPremiumText: {
    fontSize: WolfTheme.typography.caption.fontSize,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsList: {
    gap: WolfTheme.spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  benefitText: {
    fontSize: WolfTheme.typography.body.fontSize,
    color: WolfTheme.colors.textPrimary,
  },
  plansSection: {
    gap: WolfTheme.spacing.md,
  },
  plansTitle: {
    fontSize: WolfTheme.typography.h3.fontSize,
    fontWeight: WolfTheme.typography.h3.fontWeight,
    color: WolfTheme.colors.textPrimary,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.lg,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  planInfo: {
    gap: 4,
  },
  planName: {
    fontSize: WolfTheme.typography.body.fontSize,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  planDuration: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: WolfTheme.colors.warning,
  },
  comingSoon: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
  },
})
