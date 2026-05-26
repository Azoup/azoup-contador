import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatMoney } from '@/utils/masks';
import type { NfeTotals } from '@/utils/nfeTotals';

type Props = {
  totals: NfeTotals;
};

export function NfeTotalsBar({ totals }: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const stacked = width < 768;

  const items = [
    {
      label: 'Autorizadas',
      qtd: totals.qtdAutorizadas,
      valor: totals.valorAutorizadas,
      color: theme.success,
    },
    {
      label: 'Canceladas',
      qtd: totals.qtdCanceladas,
      valor: totals.valorCanceladas,
      color: theme.error,
    },
    {
      label: 'Total geral',
      qtd: totals.qtdTotal,
      valor: totals.valorTotal,
      color: theme.primary,
      highlight: true,
    },
  ];

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        stacked && styles.barStacked,
      ]}
    >
      {items.map((item) => (
        <View
          key={item.label}
          style={[
            styles.item,
            stacked && styles.itemStacked,
            item.highlight && {
              borderLeftWidth: stacked ? 0 : 2,
              borderTopWidth: stacked ? 2 : 0,
              borderColor: theme.border,
              paddingLeft: stacked ? 0 : 14,
              paddingTop: stacked ? 10 : 0,
              marginLeft: stacked ? 0 : 4,
              marginTop: stacked ? 10 : 0,
            },
          ]}
        >
          <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>
            {item.label}
          </Text>
          <Text style={[styles.itemQtd, { color: theme.text }]}>
            <Text style={styles.bold}>{item.qtd}</Text> nota(s)
          </Text>
          <Text style={[styles.itemValor, { color: item.color }]}>
            {formatMoney(item.valor)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  barStacked: {
    flexDirection: 'column',
  },
  item: {
    flex: 1,
    minWidth: 160,
    paddingVertical: 2,
  },
  itemStacked: {
    minWidth: '100%',
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  itemQtd: {
    fontSize: 14,
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
  },
  itemValor: {
    fontSize: 16,
    fontWeight: '700',
  },
});
