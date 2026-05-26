import { Download, Printer } from 'lucide-react';
import { useState } from 'react';
import { downloadXml, openDanfe } from '@/services/nfeApi';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDateBR, formatMoney } from '@/utils/masks';
import { getStatusColor, getStatusLabel } from '@/utils/nfeStatus';
import type { NotaEnriquecida } from '@/types';

type Props = {
  nota: NotaEnriquecida;
};

export function NfeCard({ nota }: Props) {
  const { theme } = useTheme();
  const [loadingDanfe, setLoadingDanfe] = useState(false);
  const [loadingXml, setLoadingXml] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleDanfe = async () => {
    try {
      setLoadingDanfe(true);
      openDanfe(nota);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível abrir o DANFE.');
    } finally {
      setLoadingDanfe(false);
    }
  };

  const handleXml = async () => {
    try {
      setLoadingXml(true);
      await downloadXml(nota);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível baixar o XML.');
    } finally {
      setLoadingXml(false);
    }
  };

  const copyChave = async () => {
    if (!nota.chave_acesso) return;
    try {
      await navigator.clipboard.writeText(nota.chave_acesso);
      showToast('Chave copiada.');
    } catch {
      showToast('Não foi possível copiar a chave.');
    }
  };

  const statusColor = getStatusColor(nota.status_sefaz, theme);
  const isCanceled = ['101', '135', '155'].includes(String(nota.status_sefaz));

  return (
    <article className="nfe-card">
      <div className="nfe-card__head">
        <h3 className="nfe-card__title">
          NF {nota.numero ?? '—'}
          {nota.serie != null ? ` / Série ${nota.serie}` : ''}
        </h3>
        <span className="nfe-card__status" style={{ color: statusColor }}>
          {getStatusLabel(nota.status_sefaz)}
        </span>
      </div>

      {nota.codigoPedido ? (
        <p className="nfe-card__line" style={{ color: 'var(--color-text-secondary)' }}>
          Pedido {nota.codigoPedido}
        </p>
      ) : null}

      {nota.tenantNome ? (
        <p className="nfe-card__line">
          <strong>Conta:</strong> {nota.tenantNome}
        </p>
      ) : null}
      <p className="nfe-card__line">
        <strong>Cliente:</strong> {nota.clienteNome ?? '—'}
      </p>
      <p className="nfe-card__line">
        <strong>Empresa:</strong> {nota.empresaNome ?? '—'}
      </p>
      <p className="nfe-card__line">
        <strong>Valor:</strong> {formatMoney(nota.valor_total)}
      </p>
      <p className="nfe-card__line">
        <strong>Emissão:</strong> {formatDateBR(nota.data_emissao)}
      </p>

      {nota.chave_acesso ? (
        <button type="button" className="nfe-card__chave" onClick={() => void copyChave()}>
          {nota.chave_acesso}
        </button>
      ) : null}

      {toast ? (
        <p style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 6 }}>{toast}</p>
      ) : null}

      <div className="nfe-card__footer">
        <button
          type="button"
          className="nfe-action"
          onClick={() => void handleDanfe()}
          disabled={loadingDanfe}
        >
          <Printer size={16} />
          {loadingDanfe ? 'Abrindo…' : 'Imprimir DANFE'}
        </button>
        <button
          type="button"
          className="nfe-action"
          onClick={() => void handleXml()}
          disabled={loadingXml}
        >
          <Download size={16} />
          {loadingXml ? 'Baixando…' : isCanceled ? 'XML cancelamento' : 'Baixar XML'}
        </button>
      </div>
    </article>
  );
}
