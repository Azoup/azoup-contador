# Handoff Contador — NFC-e do PDV Azoup

**Para:** time App Contador (`contador.azoup.com.br`)  
**De:** time PDV Confec Azoup  
**Data:** 17/jul/2026  
**Objetivo:** NFC-e emitidas no PDV aparecerem e baixarem no Contador (mesmo banco Supabase / mesmas URLs R2 do Confec).

---

## TL;DR — o que o Contador precisa fazer

| Prioridade | Ação | Obrigatório? |
|------------|------|--------------|
| — | Alterar filtro de listagem por `modelo` | **Não** — Contador já não filtra por modelo; `65` já entra |
| — | Mudar contrato de cancelamento | **Não** — `status_sefaz` 101/135/155 + `cancelamento_xml_url` basta |
| — | Aceitar URL Supabase Storage no proxy | **Não** para notas novas — PDV passou a gravar no **R2** (igual Confec) |
| Opcional | Exibir “Cupom PDV …” quando não houver `venda_id` | Melhoria de UX |
| Opcional | Ampliar `/api/xml-proxy` para `*.supabase.co/storage/…` | Só útil para NFC-e PDV **antigas** (URL Storage) |

**Conclusão:** para notas **novas** do PDV, o Contador **já está pronto**. Basta o tenant da loja estar vinculado ao contador e emitir/cancelar NFC-e no PDV.

---

## 1. Como a nota entra na lista

O Contador lista `nota_fiscal` com:

- `cliente_id_tenant` ∈ tenants do contador
- `status_sefaz IN ('100', '101', '135', '155')`

O PDV grava na **mesma** tabela `nota_fiscal` (não há tabela paralela):

| Campo | Valor PDV |
|-------|-----------|
| `modelo` | `'65'` (NFC-e) |
| `cliente_id_tenant` | UUID do tenant (`clientes_azoup`) |
| `empresa_id` | `empresas.id` do caixa |
| `status_sefaz` | `'100'` (autorizada) |
| `data_emissao` | data da emissão |
| `chave_acesso`, `protocolo_autorizacao`, `numero`, `serie` | SEFAZ |
| `valor_total` | total da nota |
| `xml_autorizado` | TEXT (`nfeProc`) |
| `xml_url` | URL pública R2 (`…/nfe_xmls/…`) |
| `danfe_url` | URL pública R2 (`…/nota_fiscal_danfe/…`) |
| `pdv_venda_id` | UUID do cupom PDV (unique) |
| `venda_id` | **sempre `null`** (pedido ERP — PDV não usa) |
| `cliente_id` | `clientes_cadastros.id` quando houver consumidor |

Se a NFC-e **não aparece**:

1. Conferir se o `cliente_id_tenant` da nota está nos tenants liberados para aquele contador.
2. Conferir `status_sefaz` (só `100` / `101` / `135` / `155`).
3. Conferir filtro de período (`data_emissao`) e empresa no Contador.

Não é necessário filtrar nem excluir `modelo = '65'`.

---

## 2. Storage / download (XML e DANFE)

### Notas novas (a partir de jul/2026)

O PDV sobe XML e DANFE no **mesmo Cloudflare R2** do Confec:

```text
https://pub-….r2.dev/nfe_xmls/{tenantId}/{empresaId}/nfce/{chave}.xml
https://pub-….r2.dev/nota_fiscal_danfe/{tenantId}/{empresaId}/nfce/{chave}.pdf
https://pub-….r2.dev/nfe_xmls/{tenantId}/{empresaId}/nfce/{chave}-cancelamento.xml
```

Compatível com o proxy atual do Contador (`/api/xml-proxy` liberando `pub-*.r2.dev/nfe_xmls/…`).

Download individual e em lote devem funcionar **igual NF-e do Confec**.

### Notas antigas do PDV (legado)

Algumas NFC-e emitidas antes da migração ainda podem ter `xml_url` / `danfe_url` apontando para **Supabase Storage** (`*.supabase.co/storage/…`).

| Fluxo Contador | Comportamento esperado |
|----------------|------------------------|
| Individual | `fetch` → se CORS falhar, `window.open(url)` costuma funcionar |
| Lote | pode falhar se o proxy só aceitar R2 |

**Opcional no Contador:** ampliar `/api/xml-proxy` para URLs `*.supabase.co/storage/...` — só para essas notas legadas.

---

## 3. Cancelamento

Quando o PDV cancela na SEFAZ, atualiza a **mesma** linha:

| Campo | Valor |
|-------|--------|
| `status_sefaz` | `'135'` (ou `101` / `155`) |
| `cancelamento_xml_url` | URL R2 do XML do evento |
| `cancelado_em` | timestamp (informativo; **não** obrigatório para listar/baixar) |
| `mensagem_sefaz` | retorno SEFAZ |

O Contador **não** precisa de `cancelado_por` nem de outros campos.

Preferência no download de cancelada: usar `cancelamento_xml_url` (já é o comportamento atual).

---

## 4. Card sem “Pedido …”

NFC-e do PDV **não** preenche `venda_id` (pedido ERP).

- Comportamento atual: card omite a linha “Pedido …” — **aceitável**.
- Número, série, empresa, valor, emissão, chave, DANFE e XML continuam normais.

### Melhoria opcional (UX)

Incluir `pdv_venda_id` no `SELECT` da listagem e, quando `venda_id` for null e `pdv_venda_id` existir, exibir algo como:

```text
Cupom PDV #{pdv_venda_id}
```

(ou o `numero` da NFC-e / número da venda PDV, se preferirem join em `pdv_venda`).

Isso **não** bloqueia aparecer nem baixar a nota.

---

## 5. Como validar (checklist Contador)

1. Contador logado com acesso ao tenant de teste do PDV.
2. No PDV: emitir uma NFC-e (homologação ou produção conforme ambiente).
3. No Contador: a nota deve aparecer na listagem (modelo 65, sem “Pedido …” se não houver `venda_id`).
4. Baixar XML individual → OK.
5. Baixar lote/pasta do período → OK (URL R2).
6. (Opcional) Cancelar no PDV → nota com status cancelada + download via `cancelamento_xml_url`.

Query útil no Supabase (mesmo projeto):

```sql
SELECT id, modelo, status_sefaz, numero, serie, data_emissao,
       xml_url, danfe_url, cancelamento_xml_url,
       venda_id, pdv_venda_id, cliente_id_tenant, empresa_id
FROM nota_fiscal
WHERE modelo = '65'
  AND cliente_id_tenant = '<uuid-tenant>'
ORDER BY data_emissao DESC
LIMIT 20;
```

---

## 6. O que o PDV **não** faz (e não precisa)

- Não cria linha em `venda` do ERP.
- Não exige mudança de schema no Contador além do que já existe em `nota_fiscal`.
- Não usa Price/assento Stripe no Contador (assunto separado).

Doc interno PDV (contexto completo): `docs/handoff/PDV_NFCE_XML_DOWNLOAD_E_CONTADOR.md`.

---

## 7. Contato / próximos passos sugeridos

| Quem | Próximo passo |
|------|----------------|
| Contador | Smoke: emitir NFC-e no PDV DEV e confirmar na listagem + download |
| Contador | (Opcional) label “Cupom PDV” via `pdv_venda_id` |
| Contador | (Opcional) proxy para URLs Supabase legadas |
| PDV | Garantir deploy do backend com upload R2 (`nfceStorage.js`) no ambiente usado pelo Contador |

Dúvidas: time PDV Azoup.
