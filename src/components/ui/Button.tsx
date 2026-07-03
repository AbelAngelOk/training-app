import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
} from 'react-native'

import { WolfTheme } from '@/constants/colors'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends TouchableOpacityProps {
  label: string
  variant?: ButtonVariant
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  size = 'lg',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? WolfTheme.colors.background : WolfTheme.colors.primary}
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`]]}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: WolfTheme.radius.button,
  },
  primary: {
    backgroundColor: WolfTheme.colors.primary,
  },
  secondary: {
    backgroundColor: WolfTheme.colors.surface,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: WolfTheme.colors.error,
  },
  size_sm: {
    height: 36,
    paddingHorizontal: WolfTheme.spacing.md,
  },
  size_md: {
    height: 44,
    paddingHorizontal: WolfTheme.spacing.lg,
  },
  size_lg: {
    height: 56,
    paddingHorizontal: WolfTheme.spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  label_primary: {
    color: WolfTheme.colors.background,
  },
  label_secondary: {
    color: WolfTheme.colors.textPrimary,
  },
  label_ghost: {
    color: WolfTheme.colors.primary,
  },
  label_danger: {
    color: '#fff',
  },
})
