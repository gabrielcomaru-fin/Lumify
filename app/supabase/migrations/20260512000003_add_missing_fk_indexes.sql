-- Índices para chaves estrangeiras sem cobertura.
-- Melhora performance de JOINs, DELETEs em cascata e consultas filtradas por usuário.
CREATE INDEX IF NOT EXISTS idx_composicao_patrimonio_ajuste_id ON public.composicao_patrimonio (ajuste_id);
CREATE INDEX IF NOT EXISTS idx_composicao_patrimonio_instituicao_id ON public.composicao_patrimonio (instituicao_id);
CREATE INDEX IF NOT EXISTS idx_contas_bancarias_usuario_id ON public.contas_bancarias (usuario_id);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria_id ON public.gastos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_id ON public.gastos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_investimentos_categoria_id ON public.investimentos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_investimentos_instituicao_id ON public.investimentos (instituicao_id);
CREATE INDEX IF NOT EXISTS idx_investimentos_usuario_id ON public.investimentos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON public.notificacoes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_planos_usuario_id ON public.planos (usuario_id);
