import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVideoPlayer, VideoView } from 'expo-video'

import { WolfTheme } from '@/constants/colors'
import { useExerciseVideo } from '@/hooks/use-exercise-video'
import type { ExerciseRow } from '@/types/database'

interface ExerciseVideoDisplayProps {
  exercise: ExerciseRow
  showInstructions?: boolean
}

/**
 * Display exercise video from ExerciseDB API with graceful fallback to instructions
 * Videos are fetched on-demand when this component mounts
 * If video fetch fails, displays instructions and tips instead
 */
export function ExerciseVideoDisplay({
  exercise,
  showInstructions = true,
}: ExerciseVideoDisplayProps) {
  const { data: videoData, isLoading, error } = useExerciseVideo(exercise.external_id)
  const [showingInstructions, setShowingInstructions] = useState(!videoData?.videoUrl)
  const videoPlayer = useVideoPlayer(videoData?.videoUrl ?? null, (player) => {
    player.loop = false
  })

  useEffect(() => {
    if (!videoData?.videoUrl) {
      setShowingInstructions(true)
    }
  }, [videoData])

  const hasVideo = !isLoading && videoData?.videoUrl
  const shouldShowFallback = !hasVideo && showInstructions

  return (
    <View style={styles.container}>
      {/* Video or Placeholder */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={WolfTheme.colors.primary} />
          <Text style={styles.loadingText}>Cargando video...</Text>
        </View>
      )}

      {hasVideo && !showingInstructions && (
        <View style={styles.videoContainer}>
          <VideoView
            style={styles.video}
            player={videoPlayer}
            allowsFullscreen
            nativeControls
          />
        </View>
      )}

      {/* Error or Fallback Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#F97316" />
          <Text style={styles.errorTitle}>No se pudo cargar el video</Text>
          <Text style={styles.errorMessage}>
            Mostrando instrucciones en su lugar. Asegurate de tener conexión a internet.
          </Text>
        </View>
      )}

      {/* Instructions and Tips Fallback */}
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

      {/* Video Available Indicator */}
      {hasVideo && (
        <View style={styles.indicator}>
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          <Text style={styles.indicatorText}>Video disponible</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: WolfTheme.spacing.md,
  },
  loadingText: {
    color: WolfTheme.colors.textSecondary,
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
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
