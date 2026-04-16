import React, { useMemo, memo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceDataContext';
import { useIncomeInsights } from '@/hooks/useIncomeInsights';
import { CompactPeriodFilter } from '@/components/CompactPeriodFilter';
import { usePeriodBounds } from '@/hooks/usePeriodBounds';
import { CompactHeader } from '@/components/CompactHeader';
import { FinancialHealthMeter } from '@/components/dashboard/FinancialHealthMeter';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { FinancialJourneyCard } from '@/components/dashboard/FinancialJourneyCard';
import {
  Target, AlertTriangle, Lightbulb, Trophy, DollarSign,
  Settings, LayoutGrid, Minimize2, CheckCircle2, Circle, ArrowRight,
} from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HomeSummaryPage = memo(function HomeSummaryPage() {
  const {
    expenses, investments, incomes, accounts,
    investmentGoal, totalPatrimony,
  } = useFinance();
  const incomeInsights = useIncomeInsights();
  const { evaluateAchievements } = useGamification();
  const { canAccessTips } = useSubscription();

  const { startDate, endDate, filter } = usePeriodBounds();
  const [focusMode, setFocusMode] = useState(false);

  // ─── Dados filtrados pelo período ────────────────────────────────────────────
  const filteredExpenses = useMemo(() => expenses.filter(exp => {
    const d = parseISO(exp.data); return d >= startDate && d <= endDate;
  }), [expenses, startDate, endDate]);

  const filteredInvestments = useMemo(() => investments.filter(inv => {
    const d = parseISO(inv.data); return d >= startDate && d <= endDate;
  }), [investments, startDate, endDate]);

  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.valor, 0);
  const totalPaid    = filteredExpenses.filter(e => e.pago).reduce((s, e) => s + e.valor, 0);
  const totalPending = filteredExpenses.filter(e => !e.pago).reduce((s, e) => s + e.valor, 0);
  const totalInvested = filteredInvestments.reduce((s, i) => s + i.valor_aporte, 0);

  // ─── Meta acumulada para o período ───────────────────────────────────────────
  const periodMonths = useMemo(() => {
    const { dateRange, periodType, year } = filter;
    if (dateRange && dateRange.from) {
      const from = dateRange.from instanceof Date ? dateRange.from : new Date(dateRange.from);
      const toRaw = dateRange.to || dateRange.from;
      const to = toRaw instanceof Date ? toRaw : new Date(toRaw);
      return eachMonthOfInterval({ start: startOfMonth(from), end: endOfMonth(to) }).length;
    }
    if (periodType === 'yearly' && year) {
      const now = new Date();
      if (year < now.getFullYear()) return 12;
      if (year > now.getFullYear()) return 0;
      return now.getMonth() + 1;
    }
    return 1;
  }, [filter]);

  const periodGoal    = (Number(investmentGoal) || 0) * periodMonths;
  const goalProgress  = periodGoal > 0 ? (totalInvested / periodGoal) * 100 : 0;

  const periodLabel = useMemo(() => {
    const { dateRange, periodType } = filter;
    if (dateRange && dateRange.from) return 'do Período';
    if (periodType === 'yearly') return 'do Ano';
    return 'do Mês';
  }, [filter]);

  const savingsRate = (totalInvested + totalPaid) > 0
    ? (totalInvested / (totalInvested + totalPaid)) * 100
    : 0;

  // ─── Série dos últimos 6 meses (streak de metas) ─────────────────────────────
  const series6 = useMemo(() => {
    const goal = Number(investmentGoal) || 0;
    const last6 = eachMonthOfInterval({ start: subMonths(new Date(), 5), end: new Date() });
    return last6.map(m => {
      const s = startOfMonth(m), e = endOfMonth(m);
      const inv = investments
        .filter(i => { const d = parseISO(i.data); return d >= s && d <= e; })
        .reduce((sum, i) => sum + i.valor_aporte, 0);
      return { label: format(m, 'MMM/yy', { locale: ptBR }), invested: inv, achieved: goal > 0 ? inv >= goal : false };
    });
  }, [investments, investmentGoal]);

  const periodElapsed = useMemo(() => {
    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = Math.min(Math.max(now.getTime() - startDate.getTime(), 0), total);
    return total > 0 ? elapsed / total : 1;
  }, [startDate, endDate]);

  const investStreak = useMemo(() => {
    let s = 0;
    for (let i = series6.length - 1; i >= 0; i--) {
      if (series6[i].achieved) s++; else break;
    }
    return s;
  }, [series6]);

  React.useEffect(() => {
    evaluateAchievements({ monthlyStreak: investStreak });
  }, [investStreak, evaluateAchievements]);

  // ─── Detecção de usuário novo ─────────────────────────────────────────────────
  const isNewUser = expenses.length === 0 && investments.length === 0;

  const onboardingSteps = useMemo(() => [
    {
      id: 'income',
      label: 'Registre uma receita',
      description: 'Informe sua renda para ter uma visão completa do seu orçamento.',
      done: incomes && incomes.length > 0,
      href: '/receitas',
      cta: 'Adicionar receita',
    },
    {
      id: 'expense',
      label: 'Adicione uma despesa',
      description: 'Controle seus gastos e entenda para onde vai seu dinheiro.',
      done: expenses.length > 0,
      href: '/gastos',
      cta: 'Adicionar despesa',
    },
    {
      id: 'goal',
      label: 'Defina sua meta mensal',
      description: 'Uma meta de investimento te mantém focado e disciplinado.',
      done: Number(investmentGoal) > 0,
      href: '/configuracoes',
      cta: 'Definir meta',
    },
    {
      id: 'investment',
      label: 'Registre seu primeiro investimento',
      description: 'Acompanhe o crescimento do seu patrimônio ao longo do tempo.',
      done: investments.length > 0,
      href: '/investimentos',
      cta: 'Adicionar investimento',
    },
  ], [incomes, expenses, investmentGoal, investments]);

  const completedSteps = onboardingSteps.filter(s => s.done).length;

  // ─── Dicas educativas (com guard: sem dados não gera dicas vazias) ────────────
  const educationTips = useMemo(() => {
    if (expenses.length === 0 && investments.length === 0) return [];

    const tips = [];

    if (periodGoal > 0) {
      const expected = periodElapsed * 100;
      if (goalProgress >= 100) {
        tips.push({ type: 'success', message: 'Parabéns! Você bateu a meta do período. Mantenha a consistência com pequenos aportes recorrentes.' });
      } else if (goalProgress < expected * 0.9) {
        tips.push({ type: 'tip', message: 'Você está abaixo do ritmo esperado para a meta. Antecipe um aporte menor hoje para aliviar o fim do período.' });
      } else {
        tips.push({ type: 'tip', message: 'Bom ritmo! Um pequeno aporte extra pode garantir que você bata a meta antes do fim do período.' });
      }
    }

    if (totalPending > 0 && totalPending >= totalPaid * 0.5) {
      tips.push({ type: 'warning', message: 'Pendências elevadas neste período. Priorize quitar para liberar fluxo para os aportes.' });
    }

    if (savingsRate < 15) {
      tips.push({ type: 'tip', message: 'Sua taxa de poupança está baixa. Avalie reduzir uma categoria de gasto e redirecionar a diferença para aportes.' });
    } else if (savingsRate >= 25) {
      tips.push({ type: 'success', message: 'Excelente taxa de poupança! Considere automatizar aportes para manter esse padrão.' });
    }

    if (investStreak >= 2) {
      tips.push({ type: 'success', message: `Ótimo hábito! Você bateu a meta por ${investStreak} meses seguidos.` });
    }

    return tips.slice(0, 3);
  }, [expenses, investments, goalProgress, periodElapsed, periodGoal, totalPending, totalPaid, savingsRate, investStreak]);

  // Seção de dicas só aparece se Pro e tiver conteúdo relevante
  const hasTipsContent = canAccessTips && (incomeInsights.recommendations.length > 0 || educationTips.length > 0);

  return (
    <>
      <Helmet>
        <title>Resumo Geral - Lumify</title>
      </Helmet>
      <div className="space-y-4 md:space-y-5 page-top">

        {/* ── Cabeçalho ────────────────────────────────────────────────────── */}
        <CompactHeader
          title="Olá!"
          subtitle="Aqui está seu resumo financeiro"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <CompactPeriodFilter />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocusMode(!focusMode)}
                className="h-8 gap-1.5 text-xs"
                title={focusMode ? 'Modo completo' : 'Modo foco'}
              >
                {focusMode ? (
                  <>
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Completo</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Foco</span>
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  R$ {totalPatrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-muted-foreground">Patrimônio Total</p>
              </div>
              <Link to="/configuracoes">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Configurações">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CompactHeader>

        {/* ── Banner de onboarding (somente usuários sem nenhum dado) ──────── */}
        {isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Bem-vindo ao Lumify!</CardTitle>
                    <CardDescription className="mt-1">
                      Complete os primeiros passos para começar a acompanhar sua saúde financeira.
                    </CardDescription>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-primary">{completedSteps}/{onboardingSteps.length}</div>
                    <p className="text-xs text-muted-foreground">concluídos</p>
                  </div>
                </div>
                <Progress value={(completedSteps / onboardingSteps.length) * 100} className="h-1.5 mt-3" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {onboardingSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      step.done
                        ? 'bg-success/5 border-success/20 opacity-60'
                        : 'bg-background border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.done
                        ? <CheckCircle2 className="h-5 w-5 text-success" />
                        : <Circle className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${step.done ? 'line-through text-muted-foreground' : ''}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                      {!step.done && (
                        <Link to={step.href}>
                          <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs text-primary">
                            {step.cta} <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Modo Foco / Completo ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {focusMode ? (

            // ── MODO FOCO ──────────────────────────────────────────────────
            <motion.div
              key="focus-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <FinancialHealthMeter />
              <QuickActionCard />

              {/* Meta do período no modo foco */}
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Meta {periodLabel}</h3>
                      <p className="text-sm text-muted-foreground">
                        {periodGoal > 0
                          ? `R$ ${totalInvested.toLocaleString('pt-BR')} de R$ ${periodGoal.toLocaleString('pt-BR')}`
                          : 'Defina uma meta para acompanhar'}
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {periodGoal > 0 ? `${Math.round(goalProgress)}%` : '-'}
                    </div>
                  </div>
                  {periodGoal > 0 && (
                    <Progress value={Math.min(goalProgress, 100)} className="h-4" />
                  )}
                  {goalProgress >= 100 && (
                    <p className="text-sm text-success mt-2 font-medium text-center">
                      Parabéns! Meta atingida!
                    </p>
                  )}
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground">
                Clique em "Completo" para ver mais detalhes
              </p>
            </motion.div>

          ) : (

            // ── MODO COMPLETO ──────────────────────────────────────────────
            <motion.div
              key="full-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 md:space-y-5"
            >
              {/* Score de saúde financeira */}
              <FinancialHealthMeter />

              {/* ── 3 KPIs ──────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">

                {/* KPI 1: Gastos */}
                <Card className="border-l-4 border-l-destructive">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Gastos no Período
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span>Pago: R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      {totalPending > 0 && (
                        <span className="text-warning">
                          Pendente: R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* KPI 2: Sobra no mês atual */}
                <Card className={`border-l-4 ${incomeInsights.availableBalance >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Sobra no Mês Atual
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Receitas − gastos pagos − investimentos do mês corrente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${incomeInsights.availableBalance >= 0 ? 'text-success' : 'text-error'}`}>
                      R$ {incomeInsights.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Pode gastar: R$ {incomeInsights.dailySpendingCapacity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia
                    </div>
                  </CardContent>
                </Card>

                {/* KPI 3: Aportes + progresso da meta (combinado) */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Aportes no Período
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Taxa de poupança: {Math.round(savingsRate)}%
                    </div>
                    {periodGoal > 0 ? (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Meta {periodLabel}</span>
                          <span className={goalProgress >= 100 ? 'text-success font-medium' : ''}>
                            {Math.round(goalProgress)}%
                          </span>
                        </div>
                        <Progress value={Math.min(goalProgress, 100)} className="h-2" />
                        {goalProgress > 100 && (
                          <p className="text-xs text-success font-medium mt-1">
                            R$ {(totalInvested - periodGoal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} além da meta!
                          </p>
                        )}
                      </div>
                    ) : (
                      <Link to="/configuracoes" className="block mt-2">
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                          <Target className="h-3 w-3 mr-1" />
                          Definir meta mensal
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* ── Próxima ação sugerida (largura total) ───────────────── */}
              <QuickActionCard />

              {/* ── Dicas (se Pro e com conteúdo) + Jornada ────────────── */}
              {hasTipsContent ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Dicas do Período
                      </CardTitle>
                      <CardDescription>Recomendações personalizadas para sua situação</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {incomeInsights.recommendations.slice(0, 3).map((rec, i) => (
                        <div key={i} className={`p-3 rounded-lg text-sm flex items-start gap-3 ${
                          rec.type === 'warning' ? 'bg-error-muted border border-error' :
                          rec.type === 'success' ? 'bg-success-muted border border-success' :
                          'bg-info-muted border border-info'
                        }`}>
                          {rec.type === 'warning' && <AlertTriangle className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />}
                          {rec.type === 'success' && <Trophy className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />}
                          {rec.type === 'tip' && <Lightbulb className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />}
                          <div>
                            <p className="font-medium">{rec.message}</p>
                            {rec.action && <p className="text-xs text-muted-foreground mt-0.5">{rec.action}</p>}
                          </div>
                        </div>
                      ))}
                      {educationTips.map((tip, i) => (
                        <div key={`tip-${i}`} className={`p-3 rounded-lg text-sm flex items-start gap-3 ${
                          tip.type === 'warning' ? 'bg-warning/10 border border-warning/30' :
                          tip.type === 'success' ? 'bg-success/10 border border-success/30' :
                          'bg-primary/10 border border-primary/30'
                        }`}>
                          {tip.type === 'warning' && <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />}
                          {tip.type === 'success' && <Trophy className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />}
                          {tip.type === 'tip' && <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />}
                          <span>{tip.message}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <FinancialJourneyCard />
                </div>
              ) : (
                <FinancialJourneyCard />
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});

export { HomeSummaryPage };
