import { StyleSheet, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { WolfTheme } from '@/constants/colors'

interface SearchInputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChangeText, placeholder = 'Buscar...' }: SearchInputProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={WolfTheme.colors.textSecondary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={WolfTheme.colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
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
    paddingHorizontal: WolfTheme.spacing.md,
    height: 48,
    gap: WolfTheme.spacing.sm,
  },
  input: {
    flex: 1,
    color: WolfTheme.colors.textPrimary,
    fontSize: 15,
  },
})
