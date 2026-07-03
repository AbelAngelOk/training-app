import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'

interface ProgressBarProps {
  progress: number // 0-1
  color?: string
  height?: number
  animated?: boolean
}

export function ProgressBar({
  progress,
  color = WolfTheme.colors.primary,
  height = 6,
  animated = true,
}: ProgressBarProps) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (animated) {
      Animated.timing(anim, {
        toValue: progress,
        duration: 600,
        useNativeDriver: false,
      }).start()
    } else {
      anim.setValue(progress)
    }
  }, [progress])

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  })

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, { width, backgroundColor: color, height }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: WolfTheme.colors.surfaceLight,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 99,
  },
})
