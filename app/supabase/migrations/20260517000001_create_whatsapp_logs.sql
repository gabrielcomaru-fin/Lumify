CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  phone      text,
  message    text,
  status     text CHECK (status IN ('success','error','not_linked','parse_error')),
  result     jsonb,
  error_msg  text
);

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Somente admins podem ler os logs
CREATE POLICY "admin_read" ON public.whatsapp_logs
  FOR SELECT USING ((auth.jwt()->'app_metadata'->>'is_admin')::boolean = true);

-- O bot insere via service role (ignora RLS), mas esta policy cobre inserts autenticados
CREATE POLICY "service_insert" ON public.whatsapp_logs
  FOR INSERT WITH CHECK (true);
