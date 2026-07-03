import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native'

import { WolfTheme } from '@/constants/colors'

interface PrimaryButtonProps {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'filled' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'filled',
  size = 'lg',
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[size],
        variant === 'filled' && styles.filled,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? '#fff' : WolfTheme.colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'outline' && styles.labelOutline,
            variant === 'ghost' && styles.labelGhost,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: WolfTheme.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: { height: 40, paddingHorizontal: WolfTheme.spacing.md },
  md: { height: 48, paddingHorizontal: WolfTheme.spacing.lg },
  lg: { height: 56, paddingHorizontal: WolfTheme.spacing.lg },
  filled: {
    backgroundColor: WolfTheme.colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: WolfTheme.colors.primary,
  },
  ghost: {
    backgroundColor: 'rgba(139,92,246,0.12)',
  },
  disabled: { opacity: 0.5 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  labelOutline: {
    color: WolfTheme.colors.primary,
  },
  labelGhost: {
    color: WolfTheme.colors.primary,
  },
})
