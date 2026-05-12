-- Substitui auth.uid() por (select auth.uid()) em todas as policies RLS.
-- Evita re-avaliação da função por linha, melhorando performance em escala.

-- usuarios
DROP POLICY IF EXISTS "Users can view own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.usuarios;
CREATE POLICY "Users can view own profile" ON public.usuarios FOR SELECT USING (id = (SELECT auth.uid()));
CREATE POLICY "Users can update own profile" ON public.usuarios FOR UPDATE USING (id = (SELECT auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.usuarios FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- contas_bancarias
DROP POLICY IF EXISTS "Users can view own accounts" ON public.contas_bancarias;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.contas_bancarias;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.contas_bancarias;
DROP POLICY IF EXISTS "Users can delete own accounts" ON public.contas_bancarias;
CREATE POLICY "Users can view own accounts" ON public.contas_bancarias FOR SELECT USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can insert own accounts" ON public.contas_bancarias FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own accounts" ON public.contas_bancarias FOR UPDATE USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete own accounts" ON public.contas_bancarias FOR DELETE USING (usuario_id = (SELECT auth.uid()));

-- gastos
DROP POLICY IF EXISTS "Users can view own expenses" ON public.gastos;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.gastos;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.gastos;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.gastos;
CREATE POLICY "Users can view own expenses" ON public.gastos FOR SELECT USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can insert own expenses" ON public.gastos FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own expenses" ON public.gastos FOR UPDATE USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete own expenses" ON public.gastos FOR DELETE USING (usuario_id = (SELECT auth.uid()));

-- investimentos
DROP POLICY IF EXISTS "Users can view own investments" ON public.investimentos;
DROP POLICY IF EXISTS "Users can insert own investments" ON public.investimentos;
DROP POLICY IF EXISTS "Users can update own investments" ON public.investimentos;
DROP POLICY IF EXISTS "Users can delete own investments" ON public.investimentos;
CREATE POLICY "Users can view own investments" ON public.investimentos FOR SELECT USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can insert own investments" ON public.investimentos FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own investments" ON public.investimentos FOR UPDATE USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete own investments" ON public.investimentos FOR DELETE USING (usuario_id = (SELECT auth.uid()));

-- notificacoes
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notificacoes;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notificacoes;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notificacoes;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notificacoes;
CREATE POLICY "Users can view own notifications" ON public.notificacoes FOR SELECT USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can insert own notifications" ON public.notificacoes FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notificacoes FOR UPDATE USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete own notifications" ON public.notificacoes FOR DELETE USING (usuario_id = (SELECT auth.uid()));

-- planos
DROP POLICY IF EXISTS "Users can view own plans" ON public.planos;
DROP POLICY IF EXISTS "Users can insert own plans" ON public.planos;
DROP POLICY IF EXISTS "Users can update own plans" ON public.planos;
CREATE POLICY "Users can view own plans" ON public.planos FOR SELECT USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can insert own plans" ON public.planos FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own plans" ON public.planos FOR UPDATE USING (usuario_id = (SELECT auth.uid()));

-- categorias
DROP POLICY IF EXISTS "Users can manage their own categories" ON public.categorias;
CREATE POLICY "Users can manage their own categories" ON public.categorias
  USING (usuario_id = (SELECT auth.uid())) WITH CHECK (usuario_id = (SELECT auth.uid()));

-- metas_investimento
DROP POLICY IF EXISTS "Users can manage their own investment goals" ON public.metas_investimento;
CREATE POLICY "Users can manage their own investment goals" ON public.metas_investimento
  USING (usuario_id = (SELECT auth.uid())) WITH CHECK (usuario_id = (SELECT auth.uid()));

-- gamificacao
DROP POLICY IF EXISTS "sel_gamificacao_self" ON public.gamificacao;
DROP POLICY IF EXISTS "ins_gamificacao_self" ON public.gamificacao;
DROP POLICY IF EXISTS "upd_gamificacao_self" ON public.gamificacao;
CREATE POLICY "sel_gamificacao_self" ON public.gamificacao FOR SELECT USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "ins_gamificacao_self" ON public.gamificacao FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));
CREATE POLICY "upd_gamificacao_self" ON public.gamificacao FOR UPDATE USING (usuario_id = (SELECT auth.uid()));

-- gamificacao_conquistas
DROP POLICY IF EXISTS "sel_gamificacao_conq_self" ON public.gamificacao_conquistas;
DROP POLICY IF EXISTS "ins_gamificacao_conq_self" ON public.gamificacao_conquistas;
DROP POLICY IF EXISTS "del_gamificacao_conq_self" ON public.gamificacao_conquistas;
CREATE POLICY "sel_gamificacao_conq_self" ON public.gamificacao_conquistas FOR SELECT USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "ins_gamificacao_conq_self" ON public.gamificacao_conquistas FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));
CREATE POLICY "del_gamificacao_conq_self" ON public.gamificacao_conquistas FOR DELETE USING (usuario_id = (SELECT auth.uid()));

-- meios_pagamento (preserva OR usuario_id IS NULL no SELECT)
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.meios_pagamento;
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.meios_pagamento;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.meios_pagamento;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.meios_pagamento;
CREATE POLICY "Users can view their own payment methods" ON public.meios_pagamento
  FOR SELECT USING ((usuario_id = (SELECT auth.uid())) OR (usuario_id IS NULL));
CREATE POLICY "Users can insert their own payment methods" ON public.meios_pagamento FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own payment methods" ON public.meios_pagamento FOR UPDATE USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete their own payment methods" ON public.meios_pagamento FOR DELETE USING (usuario_id = (SELECT auth.uid()));

-- receitas
DROP POLICY IF EXISTS "Users can manage their own receitas" ON public.receitas;
CREATE POLICY "Users can manage their own receitas" ON public.receitas
  USING (usuario_id = (SELECT auth.uid())) WITH CHECK (usuario_id = (SELECT auth.uid()));

-- ajustes_patrimonio
DROP POLICY IF EXISTS "Users can view their own adjustments" ON public.ajustes_patrimonio;
DROP POLICY IF EXISTS "Users can insert their own adjustments" ON public.ajustes_patrimonio;
DROP POLICY IF EXISTS "Users can update their own adjustments" ON public.ajustes_patrimonio;
DROP POLICY IF EXISTS "Users can delete their own adjustments" ON public.ajustes_patrimonio;
CREATE POLICY "Users can view their own adjustments" ON public.ajustes_patrimonio FOR SELECT USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can insert their own adjustments" ON public.ajustes_patrimonio FOR INSERT WITH CHECK (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own adjustments" ON public.ajustes_patrimonio FOR UPDATE USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete their own adjustments" ON public.ajustes_patrimonio FOR DELETE USING (usuario_id = (SELECT auth.uid()));

-- composicao_patrimonio (sem usuario_id direto, acessa via ajustes_patrimonio)
DROP POLICY IF EXISTS "Users can view their own composition" ON public.composicao_patrimonio;
DROP POLICY IF EXISTS "Users can insert their own composition" ON public.composicao_patrimonio;
DROP POLICY IF EXISTS "Users can update their own composition" ON public.composicao_patrimonio;
DROP POLICY IF EXISTS "Users can delete their own composition" ON public.composicao_patrimonio;
CREATE POLICY "Users can view their own composition" ON public.composicao_patrimonio
  FOR SELECT USING (EXISTS (SELECT 1 FROM ajustes_patrimonio WHERE ajustes_patrimonio.id = composicao_patrimonio.ajuste_id AND ajustes_patrimonio.usuario_id = (SELECT auth.uid())));
CREATE POLICY "Users can insert their own composition" ON public.composicao_patrimonio
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM ajustes_patrimonio WHERE ajustes_patrimonio.id = composicao_patrimonio.ajuste_id AND ajustes_patrimonio.usuario_id = (SELECT auth.uid())));
CREATE POLICY "Users can update their own composition" ON public.composicao_patrimonio
  FOR UPDATE USING (EXISTS (SELECT 1 FROM ajustes_patrimonio WHERE ajustes_patrimonio.id = composicao_patrimonio.ajuste_id AND ajustes_patrimonio.usuario_id = (SELECT auth.uid())));
CREATE POLICY "Users can delete their own composition" ON public.composicao_patrimonio
  FOR DELETE USING (EXISTS (SELECT 1 FROM ajustes_patrimonio WHERE ajustes_patrimonio.id = composicao_patrimonio.ajuste_id AND ajustes_patrimonio.usuario_id = (SELECT auth.uid())));

-- subscriptions (usa user_id, não usuario_id)
DROP POLICY IF EXISTS "Users can read own subscription" ON public.subscriptions;
CREATE POLICY "Users can read own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = (SELECT auth.uid()));
