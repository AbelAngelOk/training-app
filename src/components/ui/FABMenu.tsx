import { useRef, useState } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

export interface FABOption {
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  testID?: string
  onPress: () => void
}

interface FABMenuProps {
  options: FABOption[]
  testID?: string
}

export function FABMenu({ options, testID }: FABMenuProps) {
  const [open, setOpen] = useState(false)
  const animation = useRef(new Animated.Value(0)).current

  const toggle = () => {
    const toValue = open ? 0 : 1
    Animated.spring(animation, { toValue, useNativeDriver: true, friction: 6 }).start()
    setOpen(!open)
  }

  const handleOptionPress = (onPress: () => void) => {
    Animated.spring(animation, { toValue: 0, useNativeDriver: true }).start()
    setOpen(false)
    onPress()
  }

  const rotation = animation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] })

  return (
    <View style={styles.container} pointerEvents="box-none">
      {open && (
        <View style={styles.options}>
          {options.map((option) => (
            <Animated.View
              key={option.label}
              style={{
                opacity: animation,
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                testID={option.testID}
                style={styles.optionRow}
                onPress={() => handleOptionPress(option.onPress)}
                activeOpacity={0.8}
              >
                <View style={styles.optionLabel}>
                  <Text style={styles.optionText}>{option.label}</Text>
                </View>
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={20} color={WolfTheme.colors.background} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      <TouchableOpacity testID={testID} style={styles.fab} onPress={toggle} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={28} color={WolfTheme.colors.background} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 116,
    right: WolfTheme.spacing.lg,
    alignItems: 'flex-end',
    gap: WolfTheme.spacing.sm,
  },
  options: {
    alignItems: 'flex-end',
    gap: WolfTheme.spacing.sm,
    marginBottom: WolfTheme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WolfTheme.spacing.sm,
  },
  optionLabel: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.button,
    paddingHorizontal: WolfTheme.spacing.md,
    paddingVertical: WolfTheme.spacing.sm,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  optionText: {
    color: WolfTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WolfTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WolfTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: WolfTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
})
