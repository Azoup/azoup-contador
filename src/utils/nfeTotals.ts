import type { NotaEnriquecida } from '@/types';

const CANCELED = ['101', '135', '155'];

export type NfeTotals = {
  qtdAutorizadas: number;
  qtdCanceladas: number;
  valorAutorizadas: number;
  valorCanceladas: number;
  valorTotal: number;
  qtdTotal: number;
};

export function computeNfeTotals(notas: NotaEnriquecida[]): NfeTotals {
  let qtdAutorizadas = 0;
  let qtdCanceladas = 0;
  let valorAutorizadas = 0;
  let valorCanceladas = 0;

  for (const n of notas) {
    const valor = Number(n.valor_total ?? 0);
    if (n.status_sefaz === '100') {
      qtdAutorizadas += 1;
      valorAutorizadas += valor;
    } else if (CANCELED.includes(String(n.status_sefaz))) {
      qtdCanceladas += 1;
      valorCanceladas += valor;
    }
  }

  return {
    qtdAutorizadas,
    qtdCanceladas,
    valorAutorizadas,
    valorCanceladas,
    valorTotal: valorAutorizadas + valorCanceladas,
    qtdTotal: qtdAutorizadas + qtdCanceladas,
  };
}
