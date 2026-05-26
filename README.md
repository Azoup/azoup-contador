# App Contador — Consulta NF-e (Web)

Aplicação **web** (React + Vite) para contadores consultarem notas fiscais autorizadas e canceladas, conectada ao **Supabase** do Azoup.

## Funcionalidades

- Login com e-mail e senha (Supabase Auth)
- **Primeiro acesso**: troca da senha padrão pela nova senha
- Lista NF-e com filtros (empresa, período, status, busca) e download DANFE/XML

## Desenvolvimento local

1. Copie `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_BACKEND_URL=https://apiconfec.azoup.com.br
VITE_CONTADOR_DEFAULT_PASSWORD=ZPFsistemas
```

2. Instale e rode:

```bash
npm install
npm run dev
```

Abra http://localhost:5173

## Build e deploy (Vercel)

- **Framework:** Vite (detectado automaticamente via `vercel.json`)
- **Build:** `npm run build`
- **Saída:** `dist`
- Configure as variáveis `VITE_*` no painel da Vercel (Production)

## Login do contador

O app não cria usuário no Supabase sozinho. Cadastre em **Authentication** (Azoup ou painel Supabase) e aplique as migrations em `database/`.

## Estrutura

```
src/
  pages/          # Telas (login, notas, primeiro acesso)
  components/     # UI
  contexts/       # Auth, tema
  services/       # Supabase, NF-e
  utils/
index.html
vite.config.ts
```

Documentação completa: `ESPECIFICACAO_SISTEMA_CONSULTA_NFE.md`
