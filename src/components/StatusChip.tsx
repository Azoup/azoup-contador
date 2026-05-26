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
  const isActive = active === value;
  return (
    <button
      type="button"
      className={`chip ${isActive ? 'chip--active' : ''}`}
      onClick={() => onPress(value)}
    >
      {LABELS[value]}
    </button>
  );
}
