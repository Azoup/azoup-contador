import type { NotaFiscal } from '@/types';
import { buildXmlFileName, fetchXmlBlob, getXmlDownloadUrl } from '@/services/nfeApi';

export type BulkXmlProgress = {
  current: number;
  total: number;
  fileName: string;
};

export type BulkXmlResult = {
  saved: number;
  skippedNoXml: number;
  failed: { notaId: string; numero: number | null; error: string }[];
  folderName: string;
};

export function supportsFolderPicker(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

async function resolveUniqueFileName(
  dir: FileSystemDirectoryHandle,
  baseName: string
): Promise<string> {
  let candidate = baseName;
  let suffix = 1;
  const stem = baseName.replace(/\.xml$/i, '');

  while (true) {
    try {
      await dir.getFileHandle(candidate);
      candidate = `${stem}_${suffix}.xml`;
      suffix += 1;
    } catch {
      return candidate;
    }
  }
}

function triggerBrowserDownload(blob: Blob, fileName: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

/** Desktop: escolhe pasta e grava os XMLs. */
export async function downloadAllXmlsToFolder(
  notas: NotaFiscal[],
  onProgress?: (progress: BulkXmlProgress) => void
): Promise<BulkXmlResult> {
  if (!supportsFolderPicker()) {
    throw new Error(
      'Seu navegador não permite escolher uma pasta. Use Chrome ou Edge no computador.'
    );
  }

  let dir: FileSystemDirectoryHandle;
  try {
    dir = await window.showDirectoryPicker!({ mode: 'readwrite' });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Seleção de pasta cancelada.');
    }
    throw e;
  }

  const comXml = notas.filter((n) => getXmlDownloadUrl(n));
  const skippedNoXml = notas.length - comXml.length;
  const result: BulkXmlResult = {
    saved: 0,
    skippedNoXml,
    failed: [],
    folderName: dir.name,
  };

  for (let i = 0; i < comXml.length; i++) {
    const nota = comXml[i];
    const nome = buildXmlFileName(nota);
    onProgress?.({ current: i + 1, total: comXml.length, fileName: nome });

    try {
      const blob = await fetchXmlBlob(nota);
      const fileName = await resolveUniqueFileName(dir, nome);
      const fileHandle = await dir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      result.saved += 1;
    } catch (e) {
      result.failed.push({
        notaId: nota.id,
        numero: nota.numero,
        error: e instanceof Error ? e.message : 'Falha ao salvar XML',
      });
    }
  }

  return result;
}

/** Celular / sem pasta: dispara download de cada XML no navegador. */
export async function downloadAllXmlsViaBrowser(
  notas: NotaFiscal[],
  onProgress?: (progress: BulkXmlProgress) => void
): Promise<BulkXmlResult> {
  const comXml = notas.filter((n) => getXmlDownloadUrl(n));
  const skippedNoXml = notas.length - comXml.length;
  const result: BulkXmlResult = {
    saved: 0,
    skippedNoXml,
    failed: [],
    folderName: 'Downloads',
  };

  for (let i = 0; i < comXml.length; i++) {
    const nota = comXml[i];
    const nome = buildXmlFileName(nota);
    onProgress?.({ current: i + 1, total: comXml.length, fileName: nome });

    try {
      const blob = await fetchXmlBlob(nota);
      triggerBrowserDownload(blob, nome);
      result.saved += 1;
      // Evita o navegador bloquear vários downloads seguidos
      if (i < comXml.length - 1) await sleep(350);
    } catch (e) {
      result.failed.push({
        notaId: nota.id,
        numero: nota.numero,
        error: e instanceof Error ? e.message : 'Falha ao baixar XML',
      });
    }
  }

  return result;
}

/** Pasta no desktop; downloads do navegador no celular. */
export async function downloadAllXmls(
  notas: NotaFiscal[],
  onProgress?: (progress: BulkXmlProgress) => void
): Promise<BulkXmlResult> {
  if (supportsFolderPicker()) {
    return downloadAllXmlsToFolder(notas, onProgress);
  }
  return downloadAllXmlsViaBrowser(notas, onProgress);
}
