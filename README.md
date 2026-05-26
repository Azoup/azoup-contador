# App Contador — Consulta NF-e

Aplicativo **Expo (React Native + Web)** para contadores consultarem notas fiscais autorizadas e canceladas, conectado ao **Supabase** do Azoup.

## Funcionalidades

- Login com e-mail e senha (Supabase Auth)
- **Primeiro acesso**: troca da senha padrão `ZPFsistemas` pela nova senha informada
- Após login, resolve vínculos na tabela `contadores` e clientes `clientes_azoup`
- Lista NF-e (`nota_fiscal`) dos tenants vinculados, com filtros e download DANFE/XML

## Configuração

1. Copie `.env.example` para `.env` e preencha:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_BACKEND_URL=https://apiconfec.azoup.com.br
EXPO_PUBLIC_CONTADOR_DEFAULT_PASSWORD=ZPFsistemas
```

2. Instale dependências e inicie:

```bash
npm install
npm run web    # navegador
npm start      # Expo Go / emulador
```

## Login do contador (Authentication)

O app **não cria** usuário no Supabase sozinho. É preciso existir em **Authentication** antes:

1. **Azoup (recomendado):** Configurações → Financeiro → Contadores → editar o contador → **Salvar** (dispara criação do login com senha `ZPFsistemas`).
2. **Supabase manual:** Authentication → Users → Add user → mesmo e-mail de `contadores`, senha `ZPFsistemas`, marcar e-mail confirmado → rodar `database/fix_contador_auth_vinculo.sql`.

Depois: **Primeiro acesso** no app para trocar a senha, ou **Login** se já tiver trocado.

## Banco de dados

1. Tabela `contadores` — `migration_contadores.sql` (projeto Azoup)
2. **RLS do app** — `database/migration_contador_rls_app.sql`
3. **Vínculo auth_user_id** — `database/fix_contador_auth_vinculo.sql`

## Estrutura

```
app/                 # Rotas (expo-router)
src/
  components/        # UI (cards, filtros, header)
  contexts/          # Auth, Theme
  services/          # Supabase, NF-e, API
  utils/
```

Documentação completa: `ESPECIFICACAO_SISTEMA_CONSULTA_NFE.md`
