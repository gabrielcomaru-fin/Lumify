import React, { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAdvancedMetrics } from '@/hooks/useAdvancedMetrics';
import { useFinance } from '@/contexts/FinanceDataContext';
import { Heart, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Calculator, Info } from 'lucide-react';

const FinancialHealthMeter = memo(function FinancialHealthMeter({ showBreakdownOption = false, compact = false }) {
  const { financialHealth, trends } = useAdvancedMetrics();
  const { expenses, investments } = useFinance();
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Calcular a composição detalhada do score
  const scoreBreakdown = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.valor, 0);
    const totalInvestments = investments.reduce((sum, inv) => sum + inv.valor_aporte, 0);
    
    // Calcular média mensal de gastos (corrigido)
    const expenseMonths = new Set(
      expenses.map(expense => new Date(expense.data).toISOString().slice(0, 7))
    );
    const expenseMonthCount = Math.max(expenseMonths.size, 1);
    const averageMonthlyExpenses = totalExpenses / expenseMonthCount;
    
    // 1. Taxa de Poupança (máx 40 pontos)
    const savingsRate = financialHealth?.savingsRate || 0;
    const savingsPoints = Math.min(savingsRate * 0.4, 40);
    
    // 2. Liquidez/Reserva (máx 30 pontos)
    const liquidityRatio = financialHealth?.liquidityRatio || 0;
    const liquidityPoints = Math.min(liquidityRatio * 10, 30);
    
    // 3. Diversificação (máx 20 pontos)
    const diversification = financialHealth?.investmentDiversification || 0;
    const diversificationPoints = diversification * 0.2;
    
    // 4. Consistência (máx 10 pontos)
    // Calculada com base nos meses com investimentos
    const monthlyInvestments = {};
    investments.forEach(inv => {
      const month = new Date(inv.data).toISOString().slice(0, 7);
      monthlyInvestments[month] = (monthlyInvestments[month] || 0) + inv.valor_aporte;
    });
    const totalMonths = Object.keys(monthlyInvestments).length;
    const monthsWithInvestments = Object.values(monthlyInvestments).filter(amount => amount > 0).length;
    const consistencyRate = totalMonths > 0 ? (monthsWithInvestments / totalMonths) * 100 : 0;
    const consistencyPoints = consistencyRate * 0.1;
    
    // Número de categorias únicas
    const categoryCount = new Set(investments.map(inv => inv.categoria_id)).size;

    return {
      // Dados brutos
      totalExpenses,
      totalInvestments,
      averageMonthlyExpenses,
      expenseMonthCount,
      savingsRate,
      liquidityRatio,
      diversification,
      consistencyRate,
      categoryCount,
      totalInvestmentsCount: investments.length,
      totalMonths,
      monthsWithInvestments,
      emergencyFundTotal: financialHealth?.emergencyFundTotal || 0,
      emergencyFundFromAccounts: financialHealth?.emergencyFundFromAccounts || 0,
      emergencyFundFromInvestments: financialHealth?.emergencyFundFromInvestments || 0,
      
      // Pontos calculados
      savingsPoints: Math.round(savingsPoints * 10) / 10,
      liquidityPoints: Math.round(liquidityPoints * 10) / 10,
      diversificationPoints: Math.round(diversificationPoints * 10) / 10,
      consistencyPoints: Math.round(consistencyPoints * 10) / 10,
      
      // Máximos
      savingsMax: 40,
      liquidityMax: 30,
      diversificationMax: 20,
      consistencyMax: 10
    };
  }, [expenses, investments, financialHealth]);

  // Determinar o status e a posição no termômetro
  const healthStatus = useMemo(() => {
    const score = financialHealth?.financialHealthScore || 0;
    
    if (score >= 80) {
      return {
        label: 'Excelente',
        description: 'Parabéns! Sua saúde financeira está ótima.',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500',
        bgGradient: 'from-emerald-500 to-emerald-400',
        emoji: '🌟'
      };
    } else if (score >= 60) {
      return {
        label: 'Saudável',
        description: 'Você está no caminho certo!',
        color: 'text-green-500',
        bgColor: 'bg-green-500',
        bgGradient: 'from-green-500 to-green-400',
        emoji: '💪'
      };
    } else if (score >= 40) {
      return {
        label: 'Equilibrado',
        description: 'Há espaço para melhorar, mas está bem.',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
        bgGradient: 'from-yellow-500 to-yellow-400',
        emoji: '⚖️'
      };
    } else if (score >= 20) {
      return {
        label: 'Atenção',
        description: 'Alguns ajustes podem fazer diferença.',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500',
        bgGradient: 'from-orange-500 to-orange-400',
        emoji: '⚠️'
      };
    } else {
      return {
        label: 'Precisa de Cuidado',
        description: 'Vamos trabalhar juntos para melhorar!',
        color: 'text-red-500',
        bgColor: 'bg-red-500',
        bgGradient: 'from-red-500 to-red-400',
        emoji: '🆘'
      };
    }
  }, [financialHealth?.financialHealthScore]);

  // Os 3 principais fatores que influenciam a saúde financeira
  const topFactors = useMemo(() => {
    const factors = [];

    // Fator 1: Taxa de poupança
    const savingsRate = financialHealth?.savingsRate || 0;
    factors.push({
      name: 'Taxa de Poupança',
      value: `${Math.round(savingsRate)}%`,
      status: savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'medium' : 'bad',
      tip: savingsRate >= 20 
        ? 'Excelente! Você está poupando bem.' 
        : 'Tente poupar pelo menos 20% da sua renda.'
    });

    // Fator 2: Liquidez (usa apenas investimentos marcados como reserva de emergência)
    const liquidityRatio = financialHealth?.liquidityRatio || 0;
    const emergencyFromInvestments = financialHealth?.emergencyFundFromInvestments || 0;
    
    // Monta a dica detalhada
    let liquidityTip = '';
    if (emergencyFromInvestments === 0) {
      liquidityTip = 'Marque seus investimentos de reserva de emergência para calcular a cobertura.';
    } else if (liquidityRatio >= 6) {
      liquidityTip = `Ótimo! Sua reserva de R$ ${emergencyFromInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} cobre ${liquidityRatio.toFixed(1)} meses de gastos.`;
    } else {
      liquidityTip = `Sua reserva de R$ ${emergencyFromInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} cobre ${liquidityRatio.toFixed(1)} meses. O ideal é ter 6 meses de gastos em reserva.`;
    }
    
    factors.push({
      name: 'Reserva de Emergência',
      value: `${liquidityRatio.toFixed(1)} meses`,
      status: liquidityRatio >= 6 ? 'good' : liquidityRatio >= 3 ? 'medium' : 'bad',
      tip: liquidityTip
    });

    // Fator 3: Diversificação
    const diversification = financialHealth?.investmentDiversification || 0;
    factors.push({
      name: 'Diversificação',
      value: `${Math.round(diversification)}%`,
      status: diversification >= 60 ? 'good' : diversification >= 30 ? 'medium' : 'bad',
      tip: diversification >= 60 
        ? 'Boa diversificação nos investimentos!'
        : 'Considere diversificar mais seus investimentos.'
    });

    return factors;
  }, [financialHealth]);

  // Ícone de tendência
  const TrendIcon = useMemo(() => {
    if (trends?.overall === 'positive') return TrendingUp;
    if (trends?.overall === 'concerning') return TrendingDown;
    return Minus;
  }, [trends?.overall]);

  const trendColor = useMemo(() => {
    if (trends?.overall === 'positive') return 'text-green-500';
    if (trends?.overall === 'concerning') return 'text-red-500';
    return 'text-muted-foreground';
  }, [trends?.overall]);

  const score = financialHealth?.financialHealthScore || 0;

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/30">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          {/* Indicador circular */}
          <div className="relative flex-shrink-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative w-16 h-16 md:w-20 md:h-20"
            >
              {/* Círculo de fundo */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className={healthStatus.color}
                  stroke="currentColor"
                  initial={{ strokeDasharray: '0 264' }}
                  animate={{ 
                    strokeDasharray: `${(score / 100) * 264} 264`
                  }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              
              {/* Score central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`text-xl md:text-2xl font-bold ${healthStatus.color}`}
                >
                  {score}
                </motion.span>
                <span className="text-xs text-muted-foreground">pontos</span>
              </div>
            </motion.div>
          </div>

          {/* Informações */}
          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Heart className={`h-4 w-4 ${healthStatus.color}`} />
              <h3 className="text-base md:text-lg font-semibold">
                Saúde Financeira: <span className={healthStatus.color}>{healthStatus.label}</span>
              </h3>
              <span className="text-xl">{healthStatus.emoji}</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {healthStatus.description}
            </p>

            {/* Tendência */}
            <div className={`flex items-center justify-center md:justify-start gap-1 text-sm ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span>
                {trends?.overall === 'positive' && 'Tendência positiva'}
                {trends?.overall === 'concerning' && 'Tendência de atenção'}
                {trends?.overall === 'stable' && 'Tendência estável'}
                {trends?.overall === 'mixed' && 'Tendência mista'}
              </span>
            </div>
          </div>

          {/* Barra horizontal do termômetro */}
          {!compact && (
          <div className="w-full md:w-auto md:flex-1 max-w-xs">
            <div className="relative h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-current"
                style={{ borderColor: 'currentColor' }}
                initial={{ left: '0%' }}
                animate={{ left: `calc(${score}% - 8px)` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <div className={`absolute inset-1 rounded-full ${healthStatus.bgColor}`} />
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
          )}
        </div>

        {/* Fatores principais */}
        {!compact && (
        <TooltipProvider>
          <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3 pt-3 border-t border-border/50">
            {topFactors.map((factor, index) => (
              <Tooltip key={factor.name}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center p-1.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-help"
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className={`w-2 h-2 rounded-full ${
                        factor.status === 'good' ? 'bg-green-500' :
                        factor.status === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-muted-foreground truncate">{factor.name}</span>
                    </div>
                    <span className="text-xs md:text-sm font-semibold">{factor.value}</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">{factor.tip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        )}

        {/* Botão para expandir detalhes do cálculo - apenas se showBreakdownOption for true */}
        {!compact && showBreakdownOption && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Calculator className="h-4 w-4" />
            <span>{showBreakdown ? 'Ocultar' : 'Ver'} composição do cálculo</span>
            {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4">
                  {/* Explicação geral */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        O score de saúde financeira é calculado com base em <strong>4 pilares</strong>: 
                        Taxa de Poupança, Reserva de Emergência, Diversificação e Consistência. 
                        A pontuação máxima é <strong>100 pontos</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Breakdown detalhado */}
                  <div className="space-y-3">
                    {/* 1. Taxa de Poupança */}
                    <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">1. Taxa de Poupança</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            máx {scoreBreakdown.savingsMax} pts
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${
                          scoreBreakdown.savingsPoints >= 30 ? 'text-green-500' : 
                          scoreBreakdown.savingsPoints >= 15 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          +{scoreBreakdown.savingsPoints} pts
                        </span>
                      </div>
                      <Progress 
                        value={(scoreBreakdown.savingsPoints / scoreBreakdown.savingsMax) * 100} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <strong>Fórmula:</strong> (Investimentos ÷ (Gastos + Investimentos)) × 100 × 0.4
                        </p>
                        <p className="font-mono bg-background/50 p-1.5 rounded">
                          ({scoreBreakdown.totalInvestments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ÷ 
                          ({scoreBreakdown.totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} + 
                          {scoreBreakdown.totalInvestments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})) × 100 × 0.4 
                          = <strong>{scoreBreakdown.savingsPoints} pts</strong>
                        </p>
                        <p className="text-primary/80">
                          💡 Taxa atual: {Math.round(scoreBreakdown.savingsRate)}% — 
                          {scoreBreakdown.savingsRate >= 20 ? ' Excelente!' : ' Meta: ≥20%'}
                        </p>
                      </div>
                    </div>

                    {/* 2. Reserva de Emergência */}
                    <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">2. Reserva de Emergência</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            máx {scoreBreakdown.liquidityMax} pts
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${
                          scoreBreakdown.liquidityPoints >= 25 ? 'text-green-500' : 
                          scoreBreakdown.liquidityPoints >= 15 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          +{scoreBreakdown.liquidityPoints} pts
                        </span>
                      </div>
                      <Progress 
                        value={(scoreBreakdown.liquidityPoints / scoreBreakdown.liquidityMax) * 100} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <strong>Fórmula:</strong> (Reserva de Emergência ÷ Média Mensal de Gastos) × 10 (máx 30)
                        </p>
                        <p className="font-mono bg-background/50 p-1.5 rounded">
                          ({scoreBreakdown.emergencyFundFromInvestments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ÷ 
                          {scoreBreakdown.averageMonthlyExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) × 10 
                          = <strong>{scoreBreakdown.liquidityPoints} pts</strong>
                        </p>
                        <div className="text-primary/80 space-y-0.5">
                          <p>💡 Cobertura: {scoreBreakdown.liquidityRatio.toFixed(1)} meses de gastos</p>
                          <p className="text-xs">
                            📊 Média mensal de gastos: {scoreBreakdown.averageMonthlyExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                            (baseado em {scoreBreakdown.expenseMonthCount} mês(es) de histórico)
                          </p>
                          <p className="text-xs">
                            🏦 Reserva de emergência: {scoreBreakdown.emergencyFundFromInvestments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                            (investimentos marcados como reserva)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Diversificação */}
                    <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">3. Diversificação</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            máx {scoreBreakdown.diversificationMax} pts
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${
                          scoreBreakdown.diversificationPoints >= 15 ? 'text-green-500' : 
                          scoreBreakdown.diversificationPoints >= 8 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          +{scoreBreakdown.diversificationPoints} pts
                        </span>
                      </div>
                      <Progress 
                        value={(scoreBreakdown.diversificationPoints / scoreBreakdown.diversificationMax) * 100} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <strong>Fórmula:</strong> (Categorias Únicas ÷ 6) × 100 × 0.7 + Distribuição × 0.3 × 0.2
                        </p>
                        <p className="font-mono bg-background/50 p-1.5 rounded">
                          {scoreBreakdown.categoryCount} categorias únicas
                          = <strong>{scoreBreakdown.diversificationPoints} pts</strong>
                        </p>
                        <p className="text-primary/80">
                          💡 {scoreBreakdown.categoryCount === 1 ? 'Comece com mais categorias' : scoreBreakdown.categoryCount >= 6 ? 'Excelente diversificação!' : 'Boa diversificação!'}
                        </p>
                      </div>
                    </div>

                    {/* 4. Consistência */}
                    <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">4. Consistência</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            máx {scoreBreakdown.consistencyMax} pts
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${
                          scoreBreakdown.consistencyPoints >= 8 ? 'text-green-500' : 
                          scoreBreakdown.consistencyPoints >= 5 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          +{scoreBreakdown.consistencyPoints} pts
                        </span>
                      </div>
                      <Progress 
                        value={(scoreBreakdown.consistencyPoints / scoreBreakdown.consistencyMax) * 100} 
                        className="h-2" 
                      />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <strong>Fórmula:</strong> (Meses com Investimentos ÷ Total de Meses) × 100 × 0.1
                        </p>
                        <p className="font-mono bg-background/50 p-1.5 rounded">
                          ({scoreBreakdown.monthsWithInvestments} meses ativos ÷ {scoreBreakdown.totalMonths} meses) × 100 × 0.1 
                          = <strong>{scoreBreakdown.consistencyPoints} pts</strong>
                        </p>
                        <p className="text-primary/80">
                          💡 Você investiu em {Math.round(scoreBreakdown.consistencyRate)}% dos meses registrados
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Soma total */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Score Total</span>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">
                          {scoreBreakdown.savingsPoints} + {scoreBreakdown.liquidityPoints} + {scoreBreakdown.diversificationPoints} + {scoreBreakdown.consistencyPoints}
                        </span>
                        <span className={`text-xl font-bold ${healthStatus.color}`}>
                          = {score} pontos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        )}
      </CardContent>
    </Card>
  );
});

export { FinancialHealthMeter };

