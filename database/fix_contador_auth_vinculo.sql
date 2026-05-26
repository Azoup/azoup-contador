-- =============================================================================
-- CORREÇÃO ÚNICA: vincula auth_user_id em contadores pelo e-mail do Auth
-- Rode no SQL Editor (como postgres / service role ou SQL Editor admin)
-- Troque o e-mail na variável abaixo OU deixe NULL para corrigir TODOS
-- =============================================================================

DO $$
DECLARE
  v_email text := NULL;  -- ex: 'contador@escritorio.com.br' ou NULL = todos
BEGIN
  UPDATE public.contadores c
  SET
    auth_user_id = u.id,
    updated_at = now()
  FROM auth.users u
  WHERE lower(trim(c.email)) = lower(trim(u.email::text))
    AND (v_email IS NULL OR lower(trim(c.email)) = lower(trim(v_email)))
    AND (c.auth_user_id IS NULL OR c.auth_user_id <> u.id);
END $$;

-- Conferir (troque o e-mail):
-- SELECT c.id, c.email, c.auth_user_id, c.ativo, u.email AS auth_email
-- FROM public.contadores c
-- LEFT JOIN auth.users u ON u.id = c.auth_user_id
-- WHERE lower(c.email) = lower('seu@email.com');
