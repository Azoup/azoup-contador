import React from 'react';
import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
  FILTER_FONT_SIZE,
  FILTER_INPUT_HEIGHT,
  FILTER_LABEL_SIZE,
} from '@/constants/filterField';

type Props = {
  label: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function FilterFieldShell({ label, children, style }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.control,
          {
            borderColor: theme.borderInput,
            backgroundColor: theme.inputBg,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function useFilterWebInputStyle() {
  const { theme } = useTheme();

  return Platform.select({
    web: {
      height: FILTER_INPUT_HEIGHT - 2,
      width: '100%' as const,
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      color: theme.text,
      fontSize: FILTER_FONT_SIZE,
      padding: '0 12px',
      margin: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxSizing: 'border-box' as const,
      appearance: 'none' as const,
      WebkitAppearance: 'none' as const,
    },
    default: {},
  });
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 160,
    maxWidth: '100%',
  },
  label: {
    fontSize: FILTER_LABEL_SIZE,
    fontWeight: '600',
    marginBottom: 6,
  },
  control: {
    height: FILTER_INPUT_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
});
