import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

interface VideoThumbnailProps {
  size?: 'sm' | 'md' | 'lg'
}

export function VideoThumbnail({ size = 'md' }: VideoThumbnailProps) {
  const height = size === 'sm' ? 100 : size === 'lg' ? 250 : 180
  const playSize = size === 'sm' ? 28 : size === 'lg' ? 56 : 40

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.playButtonContainer}>
        <Ionicons name="play-circle" size={playSize} color={WolfTheme.colors.primary} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 9,
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: WolfTheme.radius.card,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  playButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
