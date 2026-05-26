import { BACKEND_URL } from './supabase';
import type { NotaFiscal } from '@/types';

export function openDanfe(nota: NotaFiscal) {
  const url = nota.danfe_url
    ? nota.danfe_url
    : BACKEND_URL
      ? `${BACKEND_URL.replace(/\/$/, '')}/api/nfe/danfe/${nota.id}`
      : null;

  if (!url) throw new Error('URL do DANFE não disponível.');

  if (typeof window !== 'undefined' && window.open) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  throw new Error('Abra o DANFE pelo navegador web.');
}

export async function downloadXml(nota: NotaFiscal) {
  const isCanceled = ['101', '135', '155'].includes(String(nota.status_sefaz));
  const url =
    nota.xml_url || (isCanceled ? nota.cancelamento_xml_url : null) || null;

  if (!url) throw new Error('XML não disponível para esta nota.');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao baixar XML.');

  const blob = await res.blob();
  const nome = `NFe_${nota.numero || 'nota'}_${nota.chave_acesso || nota.id}.xml`;

  if (typeof document !== 'undefined') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    a.click();
    URL.revokeObjectURL(a.href);
    return;
  }

  throw new Error('Download de XML disponível apenas na versão web.');
}
