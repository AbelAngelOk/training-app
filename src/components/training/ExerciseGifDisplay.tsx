import { useState } from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'
import { getExerciseGifUrl } from '@/api/exercise-gif'
import type { ExerciseRow } from '@/types/database'

interface ExerciseGifDisplayProps {
  exercise: ExerciseRow
  showInstructions?: boolean
}

/**
 * Display exercise GIF from the fitgifs API with graceful fallback to
 * instructions. The GIF URL is a plain static image (no data to fetch/cache
 * client-side), so loading/error state is handled directly off RN's own
 * Image lifecycle events rather than a data-fetching hook.
 */
export function ExerciseGifDisplay({ exercise, showInstructions = true }: ExerciseGifDisplayProps) {
  const gifUrl = getExerciseGifUrl(exercise.fitgifs_slug)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(gifUrl ? 'loading' : 'error')

  const hasGif = status === 'loaded'
  const shouldShowFallback = status !== 'loaded' && showInstructions

  return (
    <View style={styles.container}>
      {gifUrl && (status === 'loading' || status === 'loaded') && (
        <View style={styles.gifContainer}>
          <Image
            source={{ uri: gifUrl }}
            style={[styles.gif, { opacity: status === 'loaded' ? 1 : 0 }]}
            resizeMode="contain"
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
          />
          {status === 'loading' && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
              <Text style={styles.loadingText}>Cargando GIF...</Text>
            </View>
          )}
        </View>
      )}

      {status === 'error' && gifUrl && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#F97316" />
          <Text style={styles.errorTitle}>No se pudo cargar el GIF</Text>
          <Text style={styles.errorMessage}>
            Mostrando instrucciones en su lugar. Asegurate de tener conexión a internet.
          </Text>
        </View>
      )}

      {shouldShowFallback && (
        <ScrollView
          contentContainerStyle={styles.instructionsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.instructionsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={WolfTheme.colors.primary}
              />
              <Text style={styles.sectionTitle}>Instrucciones</Text>
            </View>
            <Text style={styles.instructionsText}>
              {exercise.instructions || 'Sin instrucciones disponibles'}
            </Text>
          </View>

          {exercise.tips && (
            <View style={styles.tipsSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Tips</Text>
              </View>
              <Text style={styles.tipsText}>{exercise.tips}</Text>
            </View>
          )}

          {exercise.image_url && (
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Referencia visual</Text>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={48} color={WolfTheme.colors.textSecondary} />
                <Text style={styles.imagePath}>{exercise.image_url}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {hasGif && (
        <View style={styles.indicator}>
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          <Text style={styles.indicatorText}>GIF disponible</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WolfTheme.colors.background,
  },
  gifContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.md,
  },
  loadingText: {
    color: WolfTheme.colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: WolfTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionsContent: {
    paddingHorizontal: WolfTheme.spacing.lg,
    paddingVertical: WolfTheme.spacing.lg,
    gap: WolfTheme.spacing.lg,
  },
  instructionsSection: {
    gap: WolfTheme.spacing.md,
  },
  tipsSection: {
    gap: WolfTheme.spacing.md,
  },
  imageSection: {
    gap: WolfTheme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WolfTheme.colors.textPrimary,
  },
  instructionsText: {
    fontSize: 14,
    color: WolfTheme.colors.textPrimary,
    lineHeight: 22,
  },
  tipsText: {
    fontSize: 14,
    color: WolfTheme.colors.textPrimary,
    lineHeight: 22,
    backgroundColor: WolfTheme.colors.surface,
    padding: WolfTheme.spacing.md,
    borderRadius: WolfTheme.radius.card,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  imagePlaceholder: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    gap: WolfTheme.spacing.md,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    borderStyle: 'dashed',
  },
  imagePath: {
    fontSize: 12,
    color: WolfTheme.colors.textSecondary,
    maxWidth: 200,
    textAlign: 'center',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.sm,
    marginHorizontal: WolfTheme.spacing.lg,
    marginBottom: WolfTheme.spacing.md,
    borderRadius: WolfTheme.radius.card,
  },
  indicatorText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
  },
})
