import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { StatusFilter } from '@/utils/nfeStatus';

const LABELS: Record<StatusFilter, string> = {
  todas: 'Todas',
  autorizadas: 'Autorizadas',
  canceladas: 'Canceladas',
};

type Props = {
  value: StatusFilter;
  active: StatusFilter;
  onPress: (v: StatusFilter) => void;
};

export function StatusChip({ value, active, onPress }: Props) {
  const { theme } = useTheme();
  const isActive = value === active;

  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[
        styles.chip,
        isActive
          ? { backgroundColor: theme.primary, borderColor: theme.primary }
          : {
              backgroundColor: theme.surfaceVariant,
              borderColor: theme.border,
            },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: isActive ? '#FFFFFF' : theme.textSecondary },
        ]}
      >
        {LABELS[value]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
