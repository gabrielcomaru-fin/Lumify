-- Habilita Realtime para sincronizar despesas/receitas (ex.: agente WhatsApp)
ALTER PUBLICATION supabase_realtime ADD TABLE public.gastos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.receitas;
