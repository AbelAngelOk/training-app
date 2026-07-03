import { useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

interface PasswordInputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  hasError?: boolean
  disabled?: boolean
  testID?: string
  toggleTestID?: string
  autoComplete?: 'current-password' | 'new-password'
}

export function PasswordInput({
  value,
  onChangeText,
  placeholder = '••••••••',
  hasError = false,
  disabled = false,
  testID,
  toggleTestID,
  autoComplete = 'current-password',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <View style={[styles.container, hasError && styles.containerError, disabled && styles.containerDisabled]}>
      <TextInput
        testID={testID}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={WolfTheme.colors.textSecondary}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoComplete={autoComplete}
        editable={!disabled}
      />
      <TouchableOpacity
        testID={toggleTestID}
        onPress={() => setVisible((v) => !v)}
        style={styles.toggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        disabled={disabled}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={WolfTheme.colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WolfTheme.colors.surface,
    borderRadius: WolfTheme.radius.input,
    borderWidth: 1,
    borderColor: WolfTheme.colors.border,
    height: 52,
    paddingLeft: WolfTheme.spacing.md,
    paddingRight: WolfTheme.spacing.sm,
  },
  containerError: {
    borderColor: WolfTheme.colors.error,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    color: WolfTheme.colors.textPrimary,
    fontSize: 16,
  },
  toggle: {
    padding: WolfTheme.spacing.sm,
  },
})
