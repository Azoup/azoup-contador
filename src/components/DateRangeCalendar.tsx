import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { Theme } from '@/contexts/ThemeContext';
import type { DateRangeValue } from '@/utils/dateRange';

type Props = {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  theme: Theme;
};

/** Fallback nativo: calendário disponível na versão web. */
export function DateRangeCalendar({ theme }: Props) {
  return (
    <View style={[styles.note, { borderColor: theme.border }]}>
      <Ionicons name="calendar-outline" size={20} color={theme.textMuted} />
      <Text style={[styles.text, { color: theme.textSecondary }]}>
        Use a versão web para selecionar o intervalo no calendário. Os atalhos à
        esquerda alteram o período.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    borderStyle: 'dashed',
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
