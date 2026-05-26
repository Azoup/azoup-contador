import React from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';
import { FilterFieldShell, useFilterWebInputStyle } from '@/components/FilterFieldShell';
import { FILTER_FONT_SIZE } from '@/constants/filterField';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateFilterField({ label, value, onChange }: Props) {
  const { theme } = useTheme();
  const webInputStyle = useFilterWebInputStyle();

  if (Platform.OS === 'web') {
    return (
      <FilterFieldShell label={label}>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={webInputStyle}
        />
      </FilterFieldShell>
    );
  }

  return (
    <FilterFieldShell label={label}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="AAAA-MM-DD"
        placeholderTextColor={theme.textMuted}
        style={[styles.nativeInput, { color: theme.text }]}
      />
    </FilterFieldShell>
  );
}

const styles = StyleSheet.create({
  nativeInput: {
    flex: 1,
    fontSize: FILTER_FONT_SIZE,
    paddingHorizontal: 12,
    height: '100%',
  },
});
