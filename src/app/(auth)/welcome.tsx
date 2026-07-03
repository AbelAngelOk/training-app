import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { WolfTheme } from '@/constants/colors'

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoPlaceholder} />
        <Text style={styles.title}>Training App</Text>
        <Text style={styles.subtitle}>
          Planifica, ejecuta y mide tu entrenamiento.{'\n'}Compite con los mejores.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryButtonText}>Crear cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
    paddingHorizontal: WolfTheme.spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: WolfTheme.spacing.xl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.md,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: WolfTheme.radius.card,
    backgroundColor: WolfTheme.colors.surfaceLight,
    marginBottom: WolfTheme.spacing.sm,
  },
  title: {
    fontSize: WolfTheme.typography.h1.fontSize,
    fontWeight: WolfTheme.typography.h1.fontWeight,
    color: WolfTheme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: WolfTheme.typography.body.fontSize,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: WolfTheme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: WolfTheme.colors.primary,
    borderRadius: WolfTheme.radius.button,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: WolfTheme.colors.background,
  },
  secondaryButton: {
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: WolfTheme.radius.button,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: WolfTheme.colors.textPrimary,
  },
})
