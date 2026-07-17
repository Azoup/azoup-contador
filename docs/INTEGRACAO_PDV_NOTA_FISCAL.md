# Integração PDV ↔ App Contador (mesmo banco Supabase)

Documento para o time do **PDV** (e demais sistemas Azoup) gravar NF-e no mesmo schema do **Confec**, de forma que o **App Contador** (`contador.azoup.com.br`) liste, filtre e permita download de DANFE/XML corretamente.

> O App Contador **não distingue** origem (PDV vs Confec). Ele só lê a tabela `nota_fiscal` (e relacionamentos). Se o PDV gravar no mesmo formato, as notas aparecem juntas.

---

## 1. Como o contador “enxerga” as notas

### 1.1 Login → tenant(s)

1. Contador autentica no Supabase Auth (e-mail/senha).
2. O app busca em `contadores` pelo **mesmo e-mail** do login (`ativo = true`).
3. Cada linha de `contadores` tem `cliente_id_tenant` → esse UUID é o **tenant** (conta Azoup em `clientes_azoup`).
4. Todas as consultas de NF-e usam:

```text
nota_fiscal.cliente_id_tenant IN (tenants do contador)
```

**Implicação para o PDV:**  
toda nota emitida pelo PDV **precisa** ter `cliente_id_tenant` = ID do `clientes_azoup` daquela loja/conta.  
Se gravar outro UUID (ou `NULL`), o contador **não vê** a nota (RLS + filtro da aplicação).

### 1.2 Filtro de status SEFAZ

O app **só lista** notas com:

| `status_sefaz` | Exibição no app |
|----------------|-----------------|
| `100` | Autorizada |
| `101`, `135`, `155` | Cancelada |

Outros status (digitação, rejeitada, denegada, etc.) **não aparecem**.

### 1.3 Limite e ordenação

- Ordenação: `data_emissao` DESC, depois `created_at` DESC.
- Limite: **500** notas por consulta (com filtros de período/empresa/busca).

### 1.4 Filtros da tela

| Filtro UI | Campo / regra |
|-----------|----------------|
| Empresa | `nota_fiscal.empresa_id` (empresas do tenant com `empresas.ativo = true`) |
| Período | `data_emissao` entre início e fim (`YYYY-MM-DD`) |
| Busca (44 dígitos) | `chave_acesso` |
| Busca (número curto) | `numero` |
| Busca (texto) | Cliente, empresa, pedido, chave (após enriquecimento) |
| Chip status | `100` vs `101/135/155` (só no front, sobre o resultado) |

---

## 2. O que aparece no card da NF-e

Campos lidos de `nota_fiscal` + enriquecimento:

| Na tela | Origem |
|---------|--------|
| **NF {numero} / Série {serie}** | `nota_fiscal.numero`, `nota_fiscal.serie` |
| **Status** (Autorizada / Cancelada) | `nota_fiscal.status_sefaz` |
| **Pedido {codigo}** | `venda.codigo_pedido` via `nota_fiscal.venda_id` |
| **Conta** | `clientes_azoup.nome` via `cliente_id_tenant` |
| **Cliente** | `clientes_cadastros.nome` via `nota_fiscal.cliente_id` (fallback: `venda.cliente_id`) |
| **Empresa** | `empresas.razao_social` via `nota_fiscal.empresa_id` (fallback: `venda.empresa_id`) |
| **Valor** | `nota_fiscal.valor_total` |
| **Emissão** | `nota_fiscal.data_emissao` |
| **Chave** | `nota_fiscal.chave_acesso` |
| **Imprimir DANFE** | `danfe_url` (ou fallback API Confec `/api/nfe/danfe/:id`) |
| **Baixar XML** | `xml_url` (autorizada) ou `cancelamento_xml_url` (cancelada) |

---

## 3. Checklist obrigatório para o PDV gravar NF-e

Ao autorizar (ou cancelar) uma NF-e no PDV, **inserir/atualizar** em `public.nota_fiscal`:

### 3.1 Obrigatórios para aparecer na lista

| Coluna | Tipo esperado | Regra |
|--------|---------------|--------|
| `id` | UUID | PK |
| `cliente_id_tenant` | UUID | **Mesmo** `clientes_azoup.id` da conta (igual ao Confec) |
| `status_sefaz` | text | `100` (autorizada) ou `101`/`135`/`155` (cancelada) |
| `data_emissao` | date/timestamp | Usado no filtro de período — **preencher sempre** |
| `created_at` | timestamptz | Ordenação / auditoria |

### 3.2 Fortemente recomendados (UX / download)

| Coluna | Motivo |
|--------|--------|
| `numero`, `serie` | Título do card |
| `valor_total` | Totais da tela |
| `chave_acesso` | Busca e nome do arquivo XML |
| `empresa_id` | Filtro de empresa + nome no card — **usar o mesmo UUID de `empresas` do tenant** |
| `cliente_id` | Nome do destinatário (`clientes_cadastros`) |
| `venda_id` | Mostra “Pedido …” e fallback de empresa/cliente |
| `danfe_url` | Abrir PDF |
| `xml_url` | Download XML autorizado (URL pública R2 ou storage) |
| `cancelamento_xml_url` | Download XML de cancelamento |
| `data_autorizacao` | Informativo |
| `cancelado_em` | Informativo em canceladas |
| `mensagem_sefaz` | Diagnóstico |

### 3.3 O que **não** precisa

- Não precisa de coluna “origem” (`pdv` / `confec`) — o app ignora origem.
- Não precisa gravar `xml_autorizado` gigante na listagem; o app **não** seleciona esse campo. Prefira `xml_url` no storage/R2.

---

## 4. Relacionamentos que o PDV deve respeitar

```text
clientes_azoup (tenant)
    │
    ├── empresas.cliente_id = clientes_azoup.id
    ├── contadores.cliente_id_tenant = clientes_azoup.id
    ├── clientes_cadastros.cliente_id = clientes_azoup.id   (destinatários)
    ├── venda.cliente_id_tenant = clientes_azoup.id
    └── nota_fiscal.cliente_id_tenant = clientes_azoup.id
              │
              ├── empresa_id  → empresas.id
              ├── cliente_id  → clientes_cadastros.id
              └── venda_id    → venda.id
```

### Regras práticas

1. **Empresa:** use um registro já existente em `empresas` daquele tenant (mesmo CNPJ / mesma matriz-filial do Confec). Não invente outro `empresa_id` fora dessa tabela.
2. **Cliente (destinatário):** se o PDV tiver cadastro de cliente, grave em `clientes_cadastros` (com `cliente_id` = tenant) e referencie em `nota_fiscal.cliente_id`.
3. **Venda / pedido:** se houver venda no PDV mapeada para `venda`, preencha `venda_id` e `codigo_pedido` — o card mostra “Pedido …”.
4. **Contador:** o vínculo contador ↔ tenant continua em `contadores`. O PDV **não** precisa criar contador; só precisa gravar notas no tenant certo.

---

## 5. Exemplo mínimo de INSERT (autorizada)

```sql
INSERT INTO public.nota_fiscal (
  id,
  cliente_id_tenant,
  empresa_id,
  cliente_id,
  venda_id,
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
  created_at
) VALUES (
  gen_random_uuid(),
  'UUID-DO-CLIENTES-AZOUP',      -- tenant
  'UUID-DA-EMPRESA',             -- empresas.id do mesmo tenant
  'UUID-CLIENTES-CADASTROS',     -- opcional mas recomendado
  12345,                         -- venda.id opcional
  3042,
  1,
  CURRENT_DATE,
  now(),
  1599.90,
  '35260505320214000169550010000030421961225977',
  '100',
  'Autorizado o uso da NF-e',
  'https://....r2.dev/.../danfe.pdf',
  'https://....r2.dev/.../chave_autorizado.xml',
  now()
);
```

### Cancelamento

Atualizar a mesma linha:

```sql
UPDATE public.nota_fiscal
SET
  status_sefaz = '135',          -- ou 101 / 155 conforme o evento
  cancelado_em = now(),
  cancelamento_xml_url = 'https://....r2.dev/.../cancelamento.xml',
  mensagem_sefaz = '...'
WHERE chave_acesso = '...';
```

---

## 6. Storage (DANFE / XML)

O App Contador baixa:

1. Preferência: URL em `danfe_url` / `xml_url` / `cancelamento_xml_url`.
2. Fallback DANFE: API Confec `GET {BACKEND}/api/nfe/danfe/:notaFiscalId` (se a nota existir e o backend conseguir gerar).
3. Fallback XML: proxy no próprio App Contador para URLs públicas R2 em `nfe_xmls/...`.

**Recomendação ao PDV:** após emitir, faça upload no **mesmo bucket/padrão R2** do Confec (ou qualquer URL HTTPS pública) e grave as URLs nas colunas. Assim Confec e PDV ficam iguais.

Padrão Confec (referência):

```text
nfe_xmls/{empresa_id}/{nota_fiscal_id}/{chave}_autorizado.xml
nota_fiscal_danfe/{empresa_id}/{chave}.pdf
```

---

## 7. RLS (por que a nota “some”)

O contador autenticado só lê `nota_fiscal` se:

```sql
cliente_id_tenant IN (
  SELECT cliente_id_tenant
  FROM contadores
  WHERE ativo = true
    AND lower(trim(email)) = lower(trim(auth.jwt()->>'email'))
)
```

Checklist se a nota do PDV não aparece:

1. `cliente_id_tenant` confere com o tenant do contador?
2. `status_sefaz` está em `100` / `101` / `135` / `155`?
3. `data_emissao` está no período filtrado na tela?
4. Contador tem `ativo = true` e e-mail igual ao login Auth?
5. RLS do App Contador aplicada no projeto (`database/migration_contador_rls_app.sql`)?

---

## 8. Query equivalente (o que o app faz)

Pseudocódigo da listagem:

```sql
SELECT
  id, numero, serie, data_emissao, data_autorizacao, valor_total,
  chave_acesso, status_sefaz, mensagem_sefaz,
  danfe_url, xml_url, cancelamento_xml_url, cancelado_em,
  empresa_id, cliente_id, venda_id, cliente_id_tenant, created_at
FROM nota_fiscal
WHERE cliente_id_tenant = ANY(:tenantIdsDoContador)
  AND status_sefaz IN ('100', '101', '135', '155')
  AND (:empresaId IS NULL OR empresa_id = :empresaId)
  AND (:dataInicio IS NULL OR data_emissao >= :dataInicio)
  AND (:dataFim IS NULL OR data_emissao <= :dataFim)
ORDER BY data_emissao DESC NULLS LAST, created_at DESC
LIMIT 500;
```

Depois o app enriquece com `venda`, `empresas`, `clientes_cadastros`, `clientes_azoup`.

---

## 9. Resumo para o time do PDV

| Objetivo | Ação no PDV |
|----------|-------------|
| Nota aparecer para o contador | Gravar em `nota_fiscal` com `cliente_id_tenant` correto + status `100`/`101`/`135`/`155` |
| Filtro de período funcionar | Preencher `data_emissao` |
| Filtro de empresa funcionar | Preencher `empresa_id` com UUID de `empresas` do tenant |
| Nome do cliente no card | Preencher `cliente_id` → `clientes_cadastros` |
| Pedido no card | Preencher `venda_id` → `venda.codigo_pedido` |
| DANFE / XML | Preencher `danfe_url`, `xml_url` (e `cancelamento_xml_url` se cancelar) |
| Confec + PDV juntos | **Mesma tabela, mesmos campos, mesmos tenants** — sem tabela paralela |

Não é necessário alterar o App Contador para “puxar do PDV”: basta o PDV gravar no contrato acima no banco compartilhado.
