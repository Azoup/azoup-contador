import { FolderDown, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { FormMessage } from '@/components/FormMessage';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { EmpresaFilterSelect } from '@/components/EmpresaFilterSelect';
import { NfeCard } from '@/components/NfeCard';
import { NfeTotalsBar } from '@/components/NfeTotalsBar';
import { StatusChip } from '@/components/StatusChip';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { fetchEmpresasByTenants, fetchNotasFiscais } from '@/services/nfeService';
import { getMesAtualRange, toIsoDate, type DateRangeValue } from '@/utils/dateRange';
import { statusMatchesFilter, type StatusFilter } from '@/utils/nfeStatus';
import { computeNfeTotals } from '@/utils/nfeTotals';
import {
  downloadAllXmls,
  supportsFolderPicker,
} from '@/services/bulkXmlDownload';
import type { Empresa, NotaEnriquecida } from '@/types';

export function NotasPage() {
  const { tenantIds, clientes, contadores } = useAuth();
  const isWideGrid = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 900px)');
  const useFolderPicker = supportsFolderPicker();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [notas, setNotas] = useState<NotaEnriquecida[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState('');
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeValue>(getMesAtualRange);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);
  const [bulkFeedback, setBulkFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const dataInicio = useMemo(() => toIsoDate(dateRange.from), [dateRange.from]);
  const dataFim = useMemo(() => toIsoDate(dateRange.to), [dateRange.to]);

  const loadData = useCallback(async () => {
    if (!tenantIds.length) return;

    setErro(null);
    try {
      const [empList, notaList] = await Promise.all([
        fetchEmpresasByTenants(tenantIds),
        fetchNotasFiscais({
          tenantIds,
          empresaId,
          dataInicio,
          dataFim,
          busca: busca || undefined,
        }),
      ]);
      setEmpresas(empList);
      setNotas(notaList);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar notas fiscais.');
    }
  }, [tenantIds, empresaId, dataInicio, dataFim, busca]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadData();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadData]);

  const notasFiltradas = useMemo(
    () => notas.filter((n) => statusMatchesFilter(n.status_sefaz, statusFilter)),
    [notas, statusFilter]
  );

  const totals = useMemo(() => computeNfeTotals(notas), [notas]);
  const clientesLabel = clientes.map((c) => c.nome || c.email || c.id).join(', ');

  const handleBulkXmlDownload = async () => {
    setBulkFeedback(null);

    if (!notasFiltradas.length) {
      setBulkFeedback({
        type: 'info',
        message: 'Não há notas filtradas para baixar.',
      });
      return;
    }

    try {
      setBulkDownloading(true);
      setBulkProgress(
        useFolderPicker
          ? 'Aguardando seleção da pasta…'
          : 'Preparando downloads…'
      );

      const result = await downloadAllXmls(notasFiltradas, (p) => {
        setBulkProgress(`Baixando ${p.current} de ${p.total}: ${p.fileName}`);
      });

      const parts = [
        useFolderPicker
          ? `${result.saved} XML(s) salvos em "${result.folderName}".`
          : `${result.saved} XML(s) enviados para Downloads.`,
        result.skippedNoXml > 0
          ? `${result.skippedNoXml} nota(s) sem XML disponível foram ignoradas.`
          : null,
        result.failed.length > 0
          ? `${result.failed.length} falha(s) ao baixar.`
          : null,
      ].filter(Boolean);

      setBulkFeedback({
        type: result.failed.length > 0 && result.saved === 0 ? 'error' : 'success',
        message: parts.join(' '),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível baixar os XMLs.';
      if (msg !== 'Seleção de pasta cancelada.') {
        setBulkFeedback({ type: 'error', message: msg });
      }
    } finally {
      setBulkDownloading(false);
      setBulkProgress(null);
    }
  };

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main notas-page">
        <div className="notas-page__top">
          <div>
            <h1 className="notas-page__title">Notas fiscais</h1>
            <p className="notas-page__info">
              {contadores.length} vínculo(s) · {clientes.length} cliente(s):{' '}
              {clientesLabel || '—'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--download-xml"
            disabled={loading || bulkDownloading || notasFiltradas.length === 0}
            onClick={() => void handleBulkXmlDownload()}
            title={
              useFolderPicker
                ? 'Escolha uma pasta e salve os XMLs das notas filtradas'
                : 'Baixa os XMLs das notas filtradas'
            }
          >
            <FolderDown size={18} />
            <span>
              {bulkDownloading
                ? 'Baixando XMLs…'
                : useFolderPicker
                  ? 'Baixar XMLs na pasta'
                  : 'Baixar XMLs'}
            </span>
          </button>
        </div>

        {bulkProgress ? (
          <p className="bulk-progress" role="status">
            {bulkProgress}
          </p>
        ) : null}
        {bulkFeedback ? (
          <FormMessage type={bulkFeedback.type} message={bulkFeedback.message} />
        ) : null}

        <section className="filter-card">
          <div className="search-box">
            <Search size={20} color="var(--color-text-muted)" />
            <input
              type="search"
              placeholder="Buscar por número, cliente, chave ou pedido…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void loadData();
              }}
            />
          </div>

          <div className={`filter-fields ${isMobile ? 'filter-fields--mobile' : ''}`}>
            <EmpresaFilterSelect
              empresas={empresas}
              clientes={clientes}
              value={empresaId}
              onChange={setEmpresaId}
            />
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </div>

          <div className="chips-row">
            {(['todas', 'autorizadas', 'canceladas'] as StatusFilter[]).map((s) => (
              <StatusChip key={s} value={s} active={statusFilter} onPress={setStatusFilter} />
            ))}
          </div>
        </section>

        {!loading && !erro && notas.length > 0 ? <NfeTotalsBar totals={totals} /> : null}

        {loading ? (
          <div className="page-center" style={{ minHeight: 200 }}>
            <div className="spinner" />
            <p className="status-message">Carregando notas fiscais…</p>
          </div>
        ) : erro ? (
          <p className="status-message status-message--error">{erro}</p>
        ) : notasFiltradas.length === 0 ? (
          <p className="status-message">Nenhuma nota fiscal encontrada.</p>
        ) : (
          <div className={`nfe-list ${!isMobile && isWideGrid ? 'nfe-list--grid' : ''}`}>
            {notasFiltradas.map((nota) => (
              <NfeCard key={nota.id} nota={nota} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
