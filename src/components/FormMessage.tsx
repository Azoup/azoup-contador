import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  type: 'error' | 'success' | 'info';
  message: string;
};

export function FormMessage({ type, message }: Props) {
  const { theme } = useTheme();

  const bg =
    type === 'error'
      ? 'rgba(220, 53, 69, 0.12)'
      : type === 'success'
        ? 'rgba(40, 167, 69, 0.12)'
        : theme.surfaceVariant;

  const color =
    type === 'error' ? theme.error : type === 'success' ? theme.success : theme.text;

  return (
    <View style={[styles.box, { backgroundColor: bg, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
