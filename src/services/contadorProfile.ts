import { supabase } from './supabase';
import type { ClienteAzoup, Contador } from '@/types';

export type ContadorProfile = {
  contadores: Contador[];
  clientes: ClienteAzoup[];
  tenantIds: string[];
};

const EMPTY: ContadorProfile = {
  contadores: [],
  clientes: [],
  tenantIds: [],
};

/**
 * Busca contador(es) pelo e-mail do login (Auth).
 * Depois usa cliente_id_tenant para demais consultas (NF-e, empresas).
 */
export async function loadContadorProfile(loginEmail: string): Promise<ContadorProfile> {
  const authEmail = loginEmail.trim().toLowerCase();
  if (!authEmail) return EMPTY;

  const { data: rows, error } = await supabase
    .from('contadores')
    .select('id, cliente_id_tenant, nome, email, ativo')
    .eq('ativo', true)
    .ilike('email', authEmail);

  if (error) {
    console.warn('contadores:', error.message);
    throw new Error('Não foi possível consultar o cadastro do contador.');
  }

  const contadores = (rows ?? []) as Contador[];
  if (!contadores.length) {
    return EMPTY;
  }

  const tenantIds = [...new Set(contadores.map((c) => c.cliente_id_tenant))];

  let clientes: ClienteAzoup[] = [];
  if (tenantIds.length > 0) {
    const { data: clientesData, error: clientesErr } = await supabase
      .from('clientes_azoup')
      .select('id, nome, email')
      .in('id', tenantIds);

    if (clientesErr) {
      console.warn('clientes_azoup:', clientesErr.message);
    } else {
      clientes = (clientesData ?? []) as ClienteAzoup[];
    }
  }

  return { contadores, clientes, tenantIds };
}
