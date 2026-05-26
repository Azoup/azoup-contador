import type { Theme } from '@/contexts/ThemeContext';

const AUTHORIZED = ['100'];
const CANCELED = ['101', '135', '155'];
export const LISTABLE_STATUS = [...AUTHORIZED, ...CANCELED];

export type StatusFilter = 'todas' | 'autorizadas' | 'canceladas';

export function getStatusLabel(status: string | null): string {
  if (!status) return '—';
  if (status === '100') return 'Autorizada';
  if (CANCELED.includes(status)) return 'Cancelada';
  return status;
}

export function getStatusColor(status: string | null, theme: Theme): string {
  if (status === '100') return theme.success;
  if (CANCELED.includes(String(status))) return theme.error;
  return theme.textSecondary;
}

export function statusMatchesFilter(
  status: string | null,
  filter: StatusFilter
): boolean {
  if (filter === 'todas') return true;
  if (filter === 'autorizadas') return status === '100';
  if (filter === 'canceladas') return CANCELED.includes(String(status));
  return true;
}
