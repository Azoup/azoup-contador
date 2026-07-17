import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatMoney } from '@/utils/masks';
import type { NfeTotals } from '@/utils/nfeTotals';

type Props = {
  totals: NfeTotals;
};

export function NfeTotalsBar({ totals }: Props) {
  const stacked = useMediaQuery('(max-width: 900px)');

  const items = [
    {
      label: 'Autorizadas',
      qtd: totals.qtdAutorizadas,
      valor: totals.valorAutorizadas,
      color: 'var(--color-success)',
    },
    {
      label: 'Canceladas',
      qtd: totals.qtdCanceladas,
      valor: totals.valorCanceladas,
      color: 'var(--color-error)',
    },
    {
      label: 'Total geral',
      qtd: totals.qtdTotal,
      valor: totals.valorTotal,
      color: 'var(--color-primary)',
      highlight: true,
    },
  ];

  return (
    <div className={`totals-bar ${stacked ? 'totals-bar--stacked' : ''}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`totals-item ${item.highlight ? 'totals-item--highlight' : ''}`}
        >
          <div className="totals-label">{item.label}</div>
          <div className="totals-qtd">
            <strong>{item.qtd}</strong> nota(s)
          </div>
          <div className="totals-valor" style={{ color: item.color }}>
            {formatMoney(item.valor)}
          </div>
        </div>
      ))}
    </div>
  );
}
