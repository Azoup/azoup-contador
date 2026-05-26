import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { Theme } from '@/contexts/ThemeContext';
import type { DateRangeValue } from '@/utils/dateRange';
import { startOfDay } from 'date-fns';

import 'react-day-picker/style.css';

const OVERRIDE_STYLE_ID = 'azoup-day-picker-overrides';

function applyCalendarTheme(theme: Theme) {
  let el = document.getElementById(OVERRIDE_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = OVERRIDE_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = `
    .azoup-day-picker {
      --rdp-accent-color: ${theme.primary};
      --rdp-accent-background-color: color-mix(in srgb, ${theme.primary} 18%, transparent);
      --rdp-day-height: 36px;
      --rdp-day-width: 36px;
      font-size: 14px;
    }
    .azoup-day-picker .rdp-month_caption {
      font-weight: 600;
      color: ${theme.text};
    }
    .azoup-day-picker .rdp-weekday {
      color: ${theme.textMuted};
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .azoup-day-picker .rdp-day_button {
      border-radius: 999px;
      color: ${theme.text};
    }
    .azoup-day-picker .rdp-day_button:hover:not([disabled]) {
      background: ${theme.surfaceVariant};
    }
    .azoup-day-picker .rdp-selected .rdp-day_button,
    .azoup-day-picker .rdp-range_start .rdp-day_button,
    .azoup-day-picker .rdp-range_end .rdp-day_button {
      background: ${theme.primary};
      color: #fff;
      font-weight: 600;
    }
    .azoup-day-picker .rdp-range_middle .rdp-day_button {
      background: color-mix(in srgb, ${theme.primary} 18%, transparent);
      color: ${theme.text};
      border-radius: 0;
    }
    .azoup-day-picker .rdp-today:not(.rdp-selected) .rdp-day_button {
      font-weight: 700;
      color: ${theme.primary};
    }
    .azoup-day-picker .rdp-chevron {
      fill: ${theme.textSecondary};
    }
    .azoup-day-picker .rdp-disabled .rdp-day_button {
      opacity: 0.35;
    }
  `;
}

type Props = {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  theme: Theme;
};

export function DateRangeCalendar({ value, onChange, theme }: Props) {
  const [month, setMonth] = useState(value.to);

  useEffect(() => {
    setMonth(value.to);
  }, [value.to]);

  useEffect(() => {
    applyCalendarTheme(theme);
  }, [theme]);

  const selected = useMemo(
    () => ({ from: value.from, to: value.to }),
    [value.from, value.to]
  );

  return (
    <View style={styles.wrap}>
      <DayPicker
        mode="range"
        locale={ptBR}
        month={month}
        onMonthChange={setMonth}
        selected={selected}
        onSelect={(range) => {
          if (range?.from && range?.to) {
            onChange({
              from: startOfDay(range.from),
              to: startOfDay(range.to),
            });
          }
        }}
        disabled={{ after: new Date() }}
        className="azoup-day-picker"
        showOutsideDays
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
