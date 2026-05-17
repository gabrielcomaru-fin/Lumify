import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useIncomeInsights } from '@/hooks/useIncomeInsights';
import { ArrowDownRight, ArrowUpRight, PiggyBank, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatBRL = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MonthSnapshotCard = memo(function MonthSnapshotCard() {
  const {
    totalCurrentMonthIncome: income,
    totalCurrentMonthExpenses: expenses,
    totalCurrentMonthInvestments: invested,
    availableBalance,
    savingsRate,
    daysRemaining,
    dailySpendingCapacity,
  } = useIncomeInsights();

  const monthLabel = useMemo(
    () => format(new Date(), "MMMM 'de' yyyy", { locale: ptBR }),
    []
  );

  const hasData = income > 0 || expenses > 0 || invested > 0;

  // Percentuais da barra (sobre o total "movimentado": gastos + investido + sobra positiva)
  const positiveBalance = Math.max(availableBalance, 0);
  const barTotal = expenses + invested + positiveBalance;
  const pct = (v) => (barTotal > 0 ? (v / barTotal) * 100 : 0);

  // Narrativa principal
  const narrative = useMemo(() => {
    if (!hasData) {
      return {
        title: 'Sem movimentações este mês ainda',
        subtitle: 'Registre sua primeira receita ou despesa para começar a ver sua foto financeira.',
      };
    }
    if (income === 0) {
      return {
        title: 'Você ainda não registrou receitas este mês',
        subtitle: `Já gastou R$ ${formatBRL(expenses)} e investiu R$ ${formatBRL(invested)}. Adicione suas receitas para ver o quadro completo.`,
      };
    }
    if (availableBalance < 0) {
      return {
        title: `Seu mês está R$ ${formatBRL(Math.abs(availableBalance))} no vermelho`,
        subtitle: 'Gastos pagos e aportes somados superaram suas receitas. Vale revisar o orçamento antes do fim do mês.',
      };
    }
    return {
      title: `Você guardou R$ ${formatBRL(invested)} de R$ ${formatBRL(income)} este mês`,
      subtitle: `Sobram R$ ${formatBRL(availableBalance)} disponíveis — cerca de R$ ${formatBRL(dailySpendingCapacity)} por dia até o fim do mês.`,
    };
  }, [hasData, income, expenses, invested, availableBalance, dailySpendingCapacity]);

  // Microtexto educativo contextual
  const educationalNote = useMemo(() => {
    if (!hasData || income === 0) return null;
    if (savingsRate >= 20) {
      return 'Taxa de poupança acima de 20%: padrão de quem constrói patrimônio com consistência.';
    }
    if (savingsRate >= 10) {
      return 'Você já passou do primeiro degrau (10%). O próximo objetivo saudável costuma ser 20%.';
    }
    if (savingsRate > 0) {
      return 'Comece com 10% do que entra. Pequenos aportes regulares rendem mais no longo prazo do que grandes aportes esporádicos.';
    }
    return 'Ainda sem investimentos no mês. Mesmo um aporte pequeno mantém o hábito vivo.';
  }, [hasData, income, savingsRate]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Foto de {monthLabel}
            </p>
            <h2 className="text-xl md:text-2xl font-bold leading-tight mt-1">
              {narrative.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {narrative.subtitle}
            </p>
          </div>

          {hasData && income > 0 && (
            <div className="text-right flex-shrink-0">
              <div className="text-3xl font-bold text-primary">
                {Math.round(savingsRate)}%
              </div>
              <p className="text-xs text-muted-foreground">Taxa de poupança</p>
            </div>
          )}
        </div>

        {hasData && barTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-5"
          >
            {/* Barra stacked */}
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
              {expenses > 0 && (
                <div
                  className="bg-expense h-full"
                  style={{ width: `${pct(expenses)}%` }}
                  title={`Gastos pagos: R$ ${formatBRL(expenses)}`}
                />
              )}
              {invested > 0 && (
                <div
                  className="bg-income h-full"
                  style={{ width: `${pct(invested)}%` }}
                  title={`Investido: R$ ${formatBRL(invested)}`}
                />
              )}
              {positiveBalance > 0 && (
                <div
                  className="bg-primary h-full"
                  style={{ width: `${pct(positiveBalance)}%` }}
                  title={`Sobra: R$ ${formatBRL(positiveBalance)}`}
                />
              )}
            </div>

            {/* Legenda */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <LegendItem
                icon={ArrowDownRight}
                iconClass="text-expense"
                label="Gastos pagos"
                value={`R$ ${formatBRL(expenses)}`}
                hint={income > 0 ? `${Math.round((expenses / income) * 100)}% da renda` : null}
              />
              <LegendItem
                icon={PiggyBank}
                iconClass="text-income"
                label="Investido"
                value={`R$ ${formatBRL(invested)}`}
                hint={income > 0 ? `${Math.round((invested / income) * 100)}% da renda` : null}
              />
              <LegendItem
                icon={ArrowUpRight}
                iconClass="text-primary"
                label="Sobra"
                value={`R$ ${formatBRL(availableBalance)}`}
                hint={
                  availableBalance > 0 && daysRemaining > 0
                    ? `em ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''}`
                    : null
                }
                negative={availableBalance < 0}
              />
            </div>
          </motion.div>
        )}

        {educationalNote && (
          <div className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/60">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {educationalNote}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

function LegendItem({ icon: Icon, iconClass, label, value, hint, negative }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
        <span className="truncate">{label}</span>
      </div>
      <div className={`text-sm md:text-base font-semibold mt-0.5 truncate ${negative ? 'text-error' : ''}`}>
        {value}
      </div>
      {hint && (
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{hint}</p>
      )}
    </div>
  );
}

export { MonthSnapshotCard };
