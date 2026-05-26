import { RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
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
import type { Empresa, NotaEnriquecida } from '@/types';

export function NotasPage() {
  const { tenantIds, clientes, contadores } = useAuth();
  const isWideGrid = useMediaQuery('(min-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [notas, setNotas] = useState<NotaEnriquecida[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState('');
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeValue>(getMesAtualRange);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const notasFiltradas = useMemo(
    () => notas.filter((n) => statusMatchesFilter(n.status_sefaz, statusFilter)),
    [notas, statusFilter]
  );

  const totals = useMemo(() => computeNfeTotals(notas), [notas]);
  const clientesLabel = clientes.map((c) => c.nome || c.email || c.id).join(', ');

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main notas-page">
        <h1 className="notas-page__title">Notas fiscais</h1>
        <p className="notas-page__info">
          {contadores.length} vínculo(s) · {clientes.length} cliente(s): {clientesLabel || '—'}
        </p>

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

          <div className="filter-fields">
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

          <button type="button" className="refresh-link" onClick={() => void onRefresh()}>
            <RefreshCw size={18} className={refreshing ? 'spinner' : undefined} />
            Atualizar lista
          </button>
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
