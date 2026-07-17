import { ReactNode } from 'react'
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native'

import { WolfTheme } from '@/constants/colors'

interface FormFieldProps extends TextInputProps {
  label: string
  error?: string
  /** Pass a custom control (e.g. a select) instead of the default TextInput */
  children?: ReactNode
}

/** Label + input + error, shared shape for every admin form. */
export function FormField({ label, error, children, style, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children ?? (
        <TextInput
          style={[styles.input, error && styles.inputError, style]}
          placeholderTextColor={WolfTheme.colors.textSecondary}
          {...inputProps}
        />
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: WolfTheme.spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: WolfTheme.colors.textSecondary,
  },
  input: {
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    height: 44,
    paddingHorizontal: WolfTheme.spacing.md,
    color: WolfTheme.colors.textPrimary,
    fontSize: 15,
  },
  inputError: {
    borderColor: WolfTheme.colors.error,
  },
  errorText: {
    fontSize: 12,
    color: WolfTheme.colors.error,
  },
})
