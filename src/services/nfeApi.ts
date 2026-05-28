import { BACKEND_URL } from './supabase';
import type { NotaFiscal } from '@/types';

const CANCELED_STATUS = ['101', '135', '155'];
const R2_XML_PATTERN = /^https:\/\/pub-[a-z0-9]+\.r2\.dev\/nfe_xmls\//i;

function isCanceled(nota: NotaFiscal): boolean {
  return CANCELED_STATUS.includes(String(nota.status_sefaz));
}

/** URL pública no R2 (bloqueada por CORS no fetch do browser). */
export function getDirectXmlUrl(nota: NotaFiscal): string | null {
  const canceled = isCanceled(nota);
  if (canceled && nota.cancelamento_xml_url) return nota.cancelamento_xml_url;
  return nota.xml_url || nota.cancelamento_xml_url || null;
}

/** Proxy no backend Azoup (quando disponível). */
function getBackendXmlUrl(nota: NotaFiscal): string | null {
  if (!BACKEND_URL) return null;
  const base = `${BACKEND_URL.replace(/\/$/, '')}/api/nfe/xml/${nota.id}`;
  const canceled = isCanceled(nota);
  const useCancelamento =
    canceled && Boolean(nota.cancelamento_xml_url) && !nota.xml_url;
  return useCancelamento ? `${base}?tipo=cancelamento` : base;
}

/** Proxy same-origin (Vercel / Vite dev) para contornar CORS do R2. */
function getSameOriginXmlProxyUrl(directUrl: string): string {
  return `/api/xml-proxy?url=${encodeURIComponent(directUrl)}`;
}

export function getXmlDownloadUrl(nota: NotaFiscal): string | null {
  return getDirectXmlUrl(nota) ?? getBackendXmlUrl(nota);
}

export function buildXmlFileName(nota: NotaFiscal): string {
  const chave = nota.chave_acesso?.replace(/\D/g, '') || nota.id;
  return `NFe_${nota.numero ?? 'SN'}_${chave}.xml`;
}

async function fetchWithUrl(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao baixar XML (${res.status}).`);
  }
  return res.blob();
}

export async function fetchXmlBlob(nota: NotaFiscal): Promise<Blob> {
  const direct = getDirectXmlUrl(nota);
  if (!direct) {
    throw new Error('XML não disponível para esta nota.');
  }

  const attempts: string[] = [];

  const backendUrl = getBackendXmlUrl(nota);
  if (backendUrl) attempts.push(backendUrl);

  if (R2_XML_PATTERN.test(direct)) {
    attempts.push(getSameOriginXmlProxyUrl(direct));
  }

  let lastError: Error | null = null;
  for (const url of attempts) {
    try {
      return await fetchWithUrl(url);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw (
    lastError ??
    new Error(
      'Não foi possível baixar o XML. Verifique o proxy no servidor ou a rota /api/nfe/xml no backend.'
    )
  );
}

export async function downloadXml(nota: NotaFiscal) {
  const nome = buildXmlFileName(nota);

  try {
    const blob = await fetchXmlBlob(nota);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    a.click();
    URL.revokeObjectURL(a.href);
    return;
  } catch {
    const direct = getDirectXmlUrl(nota);
    if (direct) {
      window.open(direct, '_blank', 'noopener,noreferrer');
      return;
    }
    throw new Error('XML não disponível para esta nota.');
  }
}

export function openDanfe(nota: NotaFiscal) {
  const url = nota.danfe_url
    ? nota.danfe_url
    : BACKEND_URL
      ? `${BACKEND_URL.replace(/\/$/, '')}/api/nfe/danfe/${nota.id}`
      : null;

  if (!url) throw new Error('URL do DANFE não disponível.');

  window.open(url, '_blank', 'noopener,noreferrer');
}
