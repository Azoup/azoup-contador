import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { EmpresaFilterSelect } from '@/components/EmpresaFilterSelect';
import { NfeCard } from '@/components/NfeCard';
import { NfeTotalsBar } from '@/components/NfeTotalsBar';
import { StatusChip } from '@/components/StatusChip';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { fetchEmpresasByTenants, fetchNotasFiscais } from '@/services/nfeService';
import { statusMatchesFilter, type StatusFilter } from '@/utils/nfeStatus';
import { FILTER_FONT_SIZE } from '@/constants/filterField';
import { computeNfeTotals } from '@/utils/nfeTotals';
import { getMesAtualRange, toIsoDate, type DateRangeValue } from '@/utils/dateRange';
import type { Empresa, NotaEnriquecida } from '@/types';

export default function NotasScreen() {
  const { theme } = useTheme();
  const { tenantIds, clientes, contadores } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const pagePadding = isMobile ? 12 : 30;

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [notas, setNotas] = useState<NotaEnriquecida[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState('');
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeValue>(getMesAtualRange);

  const dataInicio = useMemo(() => toIsoDate(dateRange.from), [dateRange.from]);
  const dataFim = useMemo(() => toIsoDate(dateRange.to), [dateRange.to]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');

  const loadData = useCallback(async () => {
    if (!tenantIds.length) return;

    setErro(null);
    try {
      const [empList, notaList] = await Promise.all([
        fetchEmpresasByTenants(tenantIds),
        fetchNotasFiscais({
          tenantIds,
          empresaId,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
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
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ padding: pagePadding, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: theme.primary }]}>Notas fiscais</Text>
        </View>

        <Text style={[styles.info, { color: theme.textSecondary }]}>
          {contadores.length} vínculo(s) · {clientes.length} cliente(s): {clientesLabel || '—'}
        </Text>

        <View
          style={[
            styles.filterCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: theme.inputBg, borderColor: theme.borderInput },
            ]}
          >
            <Ionicons name="search-outline" size={20} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text, fontSize: FILTER_FONT_SIZE }]}
              placeholder="Buscar por número, cliente, chave ou pedido…"
              placeholderTextColor={theme.textMuted}
              value={busca}
              onChangeText={setBusca}
              onSubmitEditing={loadData}
              returnKeyType="search"
            />
          </View>

          <View style={[styles.filterFields, isMobile && styles.filterFieldsCol]}>
            <EmpresaFilterSelect
              empresas={empresas}
              clientes={clientes}
              value={empresaId}
              onChange={setEmpresaId}
            />
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </View>

          <View style={styles.chipsRow}>
            {(['todas', 'autorizadas', 'canceladas'] as StatusFilter[]).map((s) => (
              <StatusChip key={s} value={s} active={statusFilter} onPress={setStatusFilter} />
            ))}
          </View>

          <Pressable onPress={loadData} style={styles.atualizarBtn}>
            <Ionicons name="refresh-outline" size={18} color={theme.primary} />
            <Text style={[styles.atualizar, { color: theme.primary }]}>Atualizar lista</Text>
          </Pressable>
        </View>

        {!loading && !erro && notas.length > 0 ? <NfeTotalsBar totals={totals} /> : null}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Carregando notas fiscais…
            </Text>
          </View>
        ) : erro ? (
          <Text style={[styles.infoText, { color: theme.error }]}>{erro}</Text>
        ) : notasFiltradas.length === 0 ? (
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Nenhuma nota fiscal encontrada.
          </Text>
        ) : (
          <View style={[styles.list, !isMobile && width >= 1024 && styles.listGrid]}>
            {notasFiltradas.map((nota) => (
              <View
                key={nota.id}
                style={!isMobile && width >= 1024 ? styles.gridItem : undefined}
              >
                <NfeCard nota={nota} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 13,
    marginBottom: 16,
  },
  filterCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    margin: 0,
    borderWidth: 0,
  },
  filterFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-end',
  },
  filterFieldsCol: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  atualizarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  atualizar: {
    fontSize: 14,
    fontWeight: '600',
  },
  center: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 15,
    paddingVertical: 24,
  },
  list: {},
  listGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
});
