import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export type DateRangeValue = {
  from: Date;
  to: Date;
};

export type DatePresetId = 'hoje' | 'mes_atual' | 'mes_anterior' | 'ano';

export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'mes_atual', label: 'Mês atual' },
  { id: 'mes_anterior', label: 'Mês anterior' },
  { id: 'ano', label: 'Ano' },
];

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function getMesAtualRange(): DateRangeValue {
  return getPresetRange('mes_atual');
}

export function getPresetRange(id: DatePresetId): DateRangeValue {
  const today = startOfToday();

  switch (id) {
    case 'hoje':
      return { from: today, to: today };
    case 'mes_atual':
      return {
        from: startOfMonth(today),
        to: today,
      };
    case 'mes_anterior': {
      const mesAnterior = subMonths(today, 1);
      return {
        from: startOfMonth(mesAnterior),
        to: startOfDay(endOfMonth(mesAnterior)),
      };
    }
    case 'ano':
      return {
        from: startOfYear(today),
        to: today,
      };
    default:
      return getMesAtualRange();
  }
}

export function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatRangeLabel(range: DateRangeValue): string {
  return `${format(range.from, 'dd/MM/yyyy', { locale: ptBR })} — ${format(
    range.to,
    'dd/MM/yyyy',
    { locale: ptBR }
  )}`;
}

export function detectActivePreset(range: DateRangeValue): DatePresetId | null {
  const from = startOfDay(range.from).getTime();
  const to = startOfDay(range.to).getTime();

  for (const preset of DATE_PRESETS) {
    const p = getPresetRange(preset.id);
    if (
      startOfDay(p.from).getTime() === from &&
      startOfDay(p.to).getTime() === to
    ) {
      return preset.id;
    }
  }
  return null;
}

export function normalizeRange(from?: Date, to?: Date): DateRangeValue | undefined {
  if (!from) return undefined;
  const end = to ?? from;
  return {
    from: startOfDay(from),
    to: endOfDay(end),
  };
}
