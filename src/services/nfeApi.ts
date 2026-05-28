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

export function getXmlDownloadUrl(nota: NotaFiscal): string | null {
  const isCanceled = ['101', '135', '155'].includes(String(nota.status_sefaz));
  return nota.xml_url || (isCanceled ? nota.cancelamento_xml_url : null) || null;
}

export function buildXmlFileName(nota: NotaFiscal): string {
  const chave = nota.chave_acesso?.replace(/\D/g, '') || nota.id;
  return `NFe_${nota.numero ?? 'SN'}_${chave}.xml`;
}

export async function fetchXmlBlob(nota: NotaFiscal): Promise<Blob> {
  const url = getXmlDownloadUrl(nota);
  if (!url) throw new Error('XML não disponível para esta nota.');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao baixar XML.');
  return res.blob();
}

export async function downloadXml(nota: NotaFiscal) {
  const blob = await fetchXmlBlob(nota);
  const nome = buildXmlFileName(nota);

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  a.click();
  URL.revokeObjectURL(a.href);
}
