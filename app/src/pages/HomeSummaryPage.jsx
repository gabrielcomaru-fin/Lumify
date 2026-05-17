import React, { useMemo, memo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { FinancialHealthMeter } from '@/components/dashboard/FinancialHealthMeter';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { MonthSnapshotCard } from '@/components/dashboard/MonthSnapshotCard';
import { QuickShortcuts } from '@/components/dashboard/QuickShortcuts';
import { FinancialEducationCard } from '@/components/dashboard/FinancialEducationCard';
import { PendingBillsCard } from '@/components/dashboard/PendingBillsCard';
import { TopCategoriesCard } from '@/components/dashboard/TopCategoriesCard';

import { useFinance } from '@/contexts/FinanceDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useIncomeInsights } from '@/hooks/useIncomeInsights';

import {
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';

import {
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
  parseISO,
} from 'date-fns';

const formatBRL = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const HomeSummaryPage = memo(function HomeSummaryPage() {
  const {
    expenses,
    investments,
    incomes,
    investmentGoal,
    totalPatrimony,
  } = useFinance();
  const { user } = useAuth();
  const { evaluateAchievements } = useGamification();
  const incomeInsights = useIncomeInsights();

  const firstName =
    (user?.user_metadata?.nome || user?.email || '')
      .toString()
      .trim()
      .split(' ')[0] || '';

  // ── Meta do mês corrente (home sempre fala do mês em curso) ───────────────
  const monthlyGoal = Number(investmentGoal) || 0;
  const monthInvested = incomeInsights.totalCurrentMonthInvestments || 0;
  const goalProgress = monthlyGoal > 0 ? (monthInvested / monthlyGoal) * 100 : 0;
  const goalRemaining = Math.max(monthlyGoal - monthInvested, 0);

  // ── Streak de metas dos últimos 6 meses (para gamificação) ────────────────
  const investStreak = useMemo(() => {
    if (monthlyGoal <= 0) return 0;
    const last6 = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });
    const series = last6.map((m) => {
      const s = startOfMonth(m);
      const e = endOfMonth(m);
      const invMonth = investments
        .filter((i) => {
          const d = parseISO(i.data);
          return d >= s && d <= e;
        })
        .reduce((sum, i) => sum + i.valor_aporte, 0);
      return invMonth >= monthlyGoal;
    });
    let s = 0;
    for (let i = series.length - 1; i >= 0; i--) {
      if (series[i]) s++;
      else break;
    }
    return s;
  }, [investments, monthlyGoal]);

  React.useEffect(() => {
    evaluateAchievements({ monthlyStreak: investStreak });
  }, [investStreak, evaluateAchievements]);

  // ── Onboarding para usuários novos ────────────────────────────────────────
  const isNewUser = expenses.length === 0 && investments.length === 0;

  const onboardingSteps = useMemo(
    () => [
      {
        id: 'income',
        label: 'Registre uma receita',
        description: 'Informe sua renda para ter uma visão completa do orçamento.',
        done: incomes && incomes.length > 0,
        href: '/receitas',
        cta: 'Adicionar receita',
      },
      {
        id: 'expense',
        label: 'Adicione uma despesa',
        description: 'Saber para onde o dinheiro vai é o primeiro passo do controle.',
        done: expenses.length > 0,
        href: '/gastos',
        cta: 'Adicionar despesa',
      },
      {
        id: 'goal',
        label: 'Defina sua meta mensal',
        description: 'Ter uma meta clara ajuda a manter consistência nos aportes.',
        done: monthlyGoal > 0,
        href: '/configuracoes',
        cta: 'Definir meta',
      },
      {
        id: 'investment',
        label: 'Registre seu primeiro aporte',
        description: 'Acompanhe o patrimônio crescer mês a mês.',
        done: investments.length > 0,
        href: '/investimentos',
        cta: 'Adicionar aporte',
      },
    ],
    [incomes, expenses, investments, monthlyGoal]
  );

  const completedSteps = onboardingSteps.filter((s) => s.done).length;

  return (
    <>
      <Helmet>
        <title>Resumo Geral - Lumify</title>
      </Helmet>

      <div className="space-y-5 md:space-y-6 page-top">
        {/* ── Cabeçalho enxuto ───────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              {getGreeting()}
              {firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Uma visão simples das suas finanças hoje.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:justify-end">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-right cursor-help">
                    <div className="text-xl md:text-2xl font-bold text-primary tabular-nums">
                      R$ {formatBRL(totalPatrimony)}
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center justify-end gap-1">
                      Patrimônio total
                      <Info className="h-3 w-3" />
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs leading-relaxed">
                    Soma dos saldos das suas contas com os investimentos
                    registrados. Atualiza sempre que você adiciona novos
                    lançamentos.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* ── Onboarding (apenas usuários novos) ──────────────────────────── */}
        {isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Bem-vindo ao Lumify
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Comece com estes 4 passos simples para enxergar sua vida
                      financeira.
                    </CardDescription>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-primary tabular-nums">
                      {completedSteps}/{onboardingSteps.length}
                    </div>
                    <p className="text-xs text-muted-foreground">concluídos</p>
                  </div>
                </div>
                <Progress
                  value={(completedSteps / onboardingSteps.length) * 100}
                  className="h-1.5 mt-3"
                />
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {onboardingSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      step.done
                        ? 'bg-success/5 border-success/20 opacity-70'
                        : 'bg-background border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.done ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          step.done ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                      {!step.done && (
                        <Link to={step.href}>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-1 text-xs text-primary"
                          >
                            {step.cta}
                            <ArrowRight className="h-3 w-3 ml-1" />
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

        {/* ── Foto do mês (hero narrativo) ────────────────────────────────── */}
        <MonthSnapshotCard />

        {/* ── Próxima ação + Contas em aberto (lado a lado) ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 items-stretch">
          <QuickActionCard secondaryLimit={0} />
          <PendingBillsCard />
        </div>

        {/* ── Saúde financeira + Meta do mês (lado a lado) ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <FinancialHealthMeter compact />

          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Meta deste mês
              </CardTitle>
              <CardDescription>
                {monthlyGoal > 0
                  ? 'Progresso do seu aporte mensal'
                  : 'Ter uma meta clara aumenta a consistência'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {monthlyGoal > 0 ? (
                <>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <div className="text-2xl font-bold tabular-nums">
                        R$ {formatBRL(monthInvested)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        de R$ {formatBRL(monthlyGoal)}
                      </p>
                    </div>
                    <div
                      className={`text-2xl font-bold tabular-nums ${
                        goalProgress >= 100 ? 'text-success' : 'text-primary'
                      }`}
                    >
                      {Math.round(goalProgress)}%
                    </div>
                  </div>
                  <Progress
                    value={Math.min(goalProgress, 100)}
                    className="h-2.5"
                  />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {goalProgress >= 100
                      ? `Meta batida! Você investiu R$ ${formatBRL(
                          monthInvested - monthlyGoal
                        )} além do planejado.`
                      : `Faltam R$ ${formatBRL(goalRemaining)} para bater a meta deste mês.`}
                  </p>
                  {investStreak >= 2 && (
                    <div className="text-xs text-success flex items-center gap-1.5 pt-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Você bateu a meta nos últimos {investStreak} meses seguidos.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Estudos mostram que pessoas com metas escritas têm maior
                    chance de manter o hábito de investir. Comece com um valor
                    pequeno — o importante é a constância.
                  </p>
                  <Link to="/configuracoes">
                    <Button size="sm" className="gap-1.5">
                      <Target className="h-4 w-4" />
                      Definir minha meta
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Atalhos rápidos ─────────────────────────────────────────────── */}
        <QuickShortcuts />

        {/* ── Onde foi o dinheiro + Educação (lado a lado) ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 items-stretch">
          <TopCategoriesCard />
          <FinancialEducationCard />
        </div>

        {/* Espaço final para respirar em mobile */}
        <div className="h-2" aria-hidden />
      </div>
    </>
  );
});

export { HomeSummaryPage };
