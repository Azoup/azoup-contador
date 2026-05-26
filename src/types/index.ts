export type Contador = {
  id: string;
  cliente_id_tenant: string;
  nome: string;
  email: string;
  ativo: boolean;
};

export type ClienteAzoup = {
  id: string;
  nome: string | null;
  email: string | null;
};

export type Empresa = {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  empresa_matriz: boolean;
  ativo: boolean;
  cliente_id: string;
};

export type NotaFiscal = {
  id: string;
  numero: number | null;
  serie: number | null;
  data_emissao: string | null;
  data_autorizacao: string | null;
  valor_total: number | null;
  chave_acesso: string | null;
  status_sefaz: string | null;
  mensagem_sefaz: string | null;
  danfe_url: string | null;
  xml_url: string | null;
  cancelamento_xml_url: string | null;
  cancelado_em: string | null;
  empresa_id: string | null;
  cliente_id: string | null;
  venda_id: number | null;
  cliente_id_tenant: string;
  created_at: string;
};

export type Venda = {
  id: number;
  codigo_pedido: string | null;
  empresa_id: string | null;
  cliente_id: string | null;
};

export type ClienteCadastro = {
  id: string;
  nome: string | null;
};

export type NotaEnriquecida = NotaFiscal & {
  empresaNome?: string;
  clienteNome?: string;
  codigoPedido?: string | null;
  tenantNome?: string;
};
