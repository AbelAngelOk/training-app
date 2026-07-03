import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

interface ThemeOptionProps {
  name: string
  description: string
  active: boolean
  comingSoon?: boolean
  testID?: string
}

function ThemeOption({ name, description, active, comingSoon, testID }: ThemeOptionProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.themeCard, active && styles.themeCardActive]}
      disabled={comingSoon}
    >
      <View style={styles.themeCardLeft}>
        <View style={[styles.themePreview, active && styles.themePreviewActive]}>
          {active && <Ionicons name="checkmark" size={18} color={WolfTheme.colors.background} />}
        </View>
        <View style={styles.themeInfo}>
          <Text style={styles.themeName}>{name}</Text>
          <Text style={styles.themeDescription}>{description}</Text>
        </View>
      </View>
      {comingSoon && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Próximamente</Text>
        </View>
      )}
      {active && (
        <Ionicons name="checkmark-circle" size={20} color={WolfTheme.colors.success} />
      )}
    </TouchableOpacity>
  )
}

export default function PersonalizationScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tema</Text>
          <View style={styles.themeList}>
            <ThemeOption
              testID="personalization-theme-wolf"
              name="Wolf"
              description="Oscuro con acentos grises. Tema predeterminado."
              active
            />
            <ThemeOption
              testID="personalization-theme-fox"
              name="Fox"
              description="Tonos cálidos anaranjados sobre fondo oscuro."
              active={false}
              comingSoon
            />
            <ThemeOption
              testID="personalization-theme-crimson"
              name="Crimson Night"
              description="Rojo profundo sobre negro absoluto."
              active={false}
              comingSoon
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  content: {
    padding: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.lg,
  },
  section: {
    gap: WolfTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: WolfTheme.typography.caption.fontSize,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  themeList: {
    gap: WolfTheme.spacing.sm,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    padding: WolfTheme.spacing.md,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  themeCardActive: {
    borderColor: WolfTheme.colors.primary,
  },
  themeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.md,
    flex: 1,
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WolfTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themePreviewActive: {
    backgroundColor: WolfTheme.colors.primary,
  },
  themeInfo: {
    flex: 1,
    gap: 2,
  },
  themeName: {
    fontSize: WolfTheme.typography.body.fontSize,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
  themeDescription: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
    lineHeight: 16,
  },
  comingSoonBadge: {
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: WolfTheme.spacing.sm,
    paddingVertical: 2,
  },
  comingSoonText: {
    fontSize: 10,
    color: WolfTheme.colors.textSecondary,
    fontWeight: '500',
  },
})
