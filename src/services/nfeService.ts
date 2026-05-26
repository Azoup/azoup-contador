import { supabase } from './supabase';
import { LISTABLE_STATUS } from '@/utils/nfeStatus';
import type {
  ClienteCadastro,
  Empresa,
  NotaEnriquecida,
  NotaFiscal,
  Venda,
} from '@/types';

export type NfeFilters = {
  tenantIds: string[];
  empresaId?: string | null;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
  statusFilter?: 'todas' | 'autorizadas' | 'canceladas';
};

export async function fetchEmpresasByTenants(tenantIds: string[]): Promise<Empresa[]> {
  if (!tenantIds.length) return [];

  const { data, error } = await supabase
    .from('empresas')
    .select('id, razao_social, nome_fantasia, cnpj, empresa_matriz, ativo, cliente_id')
    .in('cliente_id', tenantIds)
    .eq('ativo', true)
    .order('razao_social', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Empresa[];
}

export async function fetchNotasFiscais(
  filters: NfeFilters
): Promise<NotaEnriquecida[]> {
  const { tenantIds, empresaId, dataInicio, dataFim, busca } = filters;

  if (!tenantIds.length) return [];

  let query = supabase
    .from('nota_fiscal')
    .select(
      `
      id,
      numero,
      serie,
      data_emissao,
      data_autorizacao,
      valor_total,
      chave_acesso,
      status_sefaz,
      mensagem_sefaz,
      danfe_url,
      xml_url,
      cancelamento_xml_url,
      cancelado_em,
      empresa_id,
      cliente_id,
      venda_id,
      cliente_id_tenant,
      created_at
    `
    )
    .in('cliente_id_tenant', tenantIds)
    .in('status_sefaz', LISTABLE_STATUS)
    .order('data_emissao', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (empresaId) {
    query = query.eq('empresa_id', empresaId);
  }

  if (dataInicio) {
    query = query.gte('data_emissao', dataInicio);
  }

  if (dataFim) {
    query = query.lte('data_emissao', dataFim);
  }

  const buscaTrim = busca?.trim();
  if (buscaTrim) {
    const digits = buscaTrim.replace(/\D/g, '');
    if (digits.length === 44) {
      query = query.eq('chave_acesso', digits);
    } else if (/^\d+$/.test(digits) && digits.length <= 9) {
      query = query.eq('numero', parseInt(digits, 10));
    }
  }

  const { data, error } = await query.limit(500);
  if (error) throw error;

  const notas = (data ?? []) as NotaFiscal[];
  return enrichNotas(notas, buscaTrim);
}

async function enrichNotas(
  notas: NotaFiscal[],
  buscaTexto?: string
): Promise<NotaEnriquecida[]> {
  if (!notas.length) return [];

  const vendaIds = [
    ...new Set(notas.map((n) => n.venda_id).filter((id): id is number => id != null)),
  ];
  const empresaIds = [
    ...new Set(notas.map((n) => n.empresa_id).filter((id): id is string => !!id)),
  ];
  const clienteIds = [
    ...new Set(notas.map((n) => n.cliente_id).filter((id): id is string => !!id)),
  ];
  const tenantIds = [...new Set(notas.map((n) => n.cliente_id_tenant))];

  const [vendasRes, empresasRes, clientesRes, tenantsRes] = await Promise.all([
    vendaIds.length
      ? supabase
          .from('venda')
          .select('id, codigo_pedido, empresa_id, cliente_id')
          .in('id', vendaIds)
      : Promise.resolve({ data: [] as Venda[], error: null }),
    empresaIds.length
      ? supabase.from('empresas').select('id, razao_social, cnpj').in('id', empresaIds)
      : Promise.resolve({ data: [] as { id: string; razao_social: string; cnpj: string }[], error: null }),
    clienteIds.length
      ? supabase.from('clientes_cadastros').select('id, nome').in('id', clienteIds)
      : Promise.resolve({ data: [] as ClienteCadastro[], error: null }),
    tenantIds.length
      ? supabase.from('clientes_azoup').select('id, nome').in('id', tenantIds)
      : Promise.resolve({ data: [] as { id: string; nome: string | null }[], error: null }),
  ]);

  if (vendasRes.error) throw vendasRes.error;
  if (empresasRes.error) throw empresasRes.error;
  if (clientesRes.error) throw clientesRes.error;
  if (tenantsRes.error) throw tenantsRes.error;

  const vendaMap = new Map((vendasRes.data ?? []).map((v) => [v.id, v as Venda]));
  const empresaMap = new Map(
    (empresasRes.data ?? []).map((e) => [e.id, e as { id: string; razao_social: string }])
  );
  const clienteMap = new Map(
    (clientesRes.data ?? []).map((c) => [c.id, c as ClienteCadastro])
  );
  const tenantMap = new Map(
    (tenantsRes.data ?? []).map((t) => [t.id, t.nome])
  );

  let enriched: NotaEnriquecida[] = notas.map((n) => {
    const venda = n.venda_id ? vendaMap.get(n.venda_id) : undefined;
    const empId = n.empresa_id ?? venda?.empresa_id;
    const emp = empId ? empresaMap.get(empId) : undefined;
    const cliId = n.cliente_id ?? venda?.cliente_id;
    const cli = cliId ? clienteMap.get(cliId) : undefined;

    return {
      ...n,
      empresaNome: emp?.razao_social,
      clienteNome: cli?.nome ?? undefined,
      codigoPedido: venda?.codigo_pedido,
      tenantNome: tenantMap.get(n.cliente_id_tenant) ?? undefined,
    };
  });

  if (buscaTexto && buscaTexto.replace(/\D/g, '').length !== 44 && !/^\d+$/.test(buscaTexto.replace(/\D/g, ''))) {
    const term = buscaTexto.toLowerCase();
    enriched = enriched.filter(
      (n) =>
        String(n.numero ?? '').includes(term) ||
        (n.clienteNome?.toLowerCase().includes(term) ?? false) ||
        (n.empresaNome?.toLowerCase().includes(term) ?? false) ||
        (n.codigoPedido?.toLowerCase().includes(term) ?? false) ||
        (n.chave_acesso?.includes(term) ?? false)
    );
  }

  return enriched;
}
