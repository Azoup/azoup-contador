import {
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export type DateRangeValue = {
  from: Date;
  to: Date;
};

export type DatePresetId = 'hoje' | '7d' | '30d' | '90d';

export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: '7d', label: 'Últimos 7 dias' },
  { id: '30d', label: 'Últimos 30 dias' },
  { id: '90d', label: 'Últimos 90 dias' },
];

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function getMesAtualRange(): DateRangeValue {
  const today = startOfToday();
  return {
    from: startOfMonth(today),
    to: today,
  };
}

export function getPresetRange(id: DatePresetId): DateRangeValue {
  const today = startOfToday();

  switch (id) {
    case 'hoje':
      return { from: today, to: today };
    case '7d':
      return { from: subDays(today, 6), to: today };
    case '30d':
      return { from: subDays(today, 29), to: today };
    case '90d':
      return { from: subDays(today, 89), to: today };
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
