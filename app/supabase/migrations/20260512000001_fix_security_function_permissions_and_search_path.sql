-- Revogar EXECUTE de handle_new_user() para roles públicos (anon e authenticated).
-- A função só deve ser chamada internamente via trigger, não via API REST.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Fixar search_path mutável nas funções de updated_at para evitar injeção de schema.
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
