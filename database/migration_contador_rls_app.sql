-- App Contador — RLS mínimo (e-mail do login = contadores.email)
-- Execute no SQL Editor do Supabase (projeto Azoup).

-- Contador: leitura pelo e-mail autenticado
DROP POLICY IF EXISTS contadores_select_own ON public.contadores;
DROP POLICY IF EXISTS contadores_select_by_login_email ON public.contadores;
CREATE POLICY contadores_select_by_login_email
  ON public.contadores
  FOR SELECT
  TO authenticated
  USING (
    lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  );

-- NF-e e cadastros do(s) tenant(s) do contador (mesmo e-mail)
DROP POLICY IF EXISTS nota_fiscal_select_contador ON public.nota_fiscal;
CREATE POLICY nota_fiscal_select_contador
  ON public.nota_fiscal
  FOR SELECT
  TO authenticated
  USING (
    cliente_id_tenant IN (
      SELECT c.cliente_id_tenant
      FROM public.contadores c
      WHERE c.ativo = true
        AND lower(trim(c.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
  );

DROP POLICY IF EXISTS clientes_azoup_select_contador ON public.clientes_azoup;
CREATE POLICY clientes_azoup_select_contador
  ON public.clientes_azoup
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT c.cliente_id_tenant
      FROM public.contadores c
      WHERE c.ativo = true
        AND lower(trim(c.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
  );

DROP POLICY IF EXISTS empresas_select_contador ON public.empresas;
CREATE POLICY empresas_select_contador
  ON public.empresas
  FOR SELECT
  TO authenticated
  USING (
    cliente_id IN (
      SELECT c.cliente_id_tenant
      FROM public.contadores c
      WHERE c.ativo = true
        AND lower(trim(c.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
  );

DROP POLICY IF EXISTS venda_select_contador ON public.venda;
CREATE POLICY venda_select_contador
  ON public.venda
  FOR SELECT
  TO authenticated
  USING (
    cliente_id_tenant IN (
      SELECT c.cliente_id_tenant
      FROM public.contadores c
      WHERE c.ativo = true
        AND lower(trim(c.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
  );

DROP POLICY IF EXISTS clientes_cadastros_select_contador ON public.clientes_cadastros;
CREATE POLICY clientes_cadastros_select_contador
  ON public.clientes_cadastros
  FOR SELECT
  TO authenticated
  USING (
    cliente_id IN (
      SELECT c.cliente_id_tenant
      FROM public.contadores c
      WHERE c.ativo = true
        AND lower(trim(c.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
  );
