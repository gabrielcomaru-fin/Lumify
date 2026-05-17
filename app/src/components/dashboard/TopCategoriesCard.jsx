import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceDataContext';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  parseISO,
  subMonths,
} from 'date-fns';

const formatBRL = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TopCategoriesCard = memo(function TopCategoriesCard() {
  const { expenses, categories } = useFinance();

  const { top, totalMonth, hasData, highlight } = useMemo(() => {
    const today = new Date();
    const currStart = startOfMonth(today);
    const currEnd = endOfMonth(today);
    const prevStart = startOfMonth(subMonths(today, 1));
    const prevEnd = endOfMonth(subMonths(today, 1));

    const curr = expenses.filter((e) => {
      const d = parseISO(e.data);
      return d >= currStart && d <= currEnd;
    });
    const prev = expenses.filter((e) => {
      const d = parseISO(e.data);
      return d >= prevStart && d <= prevEnd;
    });

    const totalCurr = curr.reduce((s, e) => s + e.valor, 0);

    const byCatCurr = {};
    curr.forEach((e) => {
      const k = e.categoria_id || 'none';
      byCatCurr[k] = (byCatCurr[k] || 0) + e.valor;
    });

    const byCatPrev = {};
    prev.forEach((e) => {
      const k = e.categoria_id || 'none';
      byCatPrev[k] = (byCatPrev[k] || 0) + e.valor;
    });

    const list = Object.entries(byCatCurr)
      .map(([id, valor]) => {
        const cat = categories.find((c) => c.id === id);
        const prevValor = byCatPrev[id] || 0;
        const diff = prevValor > 0 ? ((valor - prevValor) / prevValor) * 100 : null;
        return {
          id,
          nome: cat?.nome || 'Sem categoria',
          cor: cat?.cor || '#64748b',
          valor,
          pct: totalCurr > 0 ? (valor / totalCurr) * 100 : 0,
          diff,
          prevValor,
        };
      })
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 3);

    // Destaque: maior aumento relativo (>25%) dentre o top 3
    const worseItem = list
      .filter((i) => i.diff !== null && i.diff > 25)
      .sort((a, b) => b.diff - a.diff)[0];

    return {
      top: list,
      totalMonth: totalCurr,
      hasData: totalCurr > 0,
      highlight: worseItem || null,
    };
  }, [expenses, categories]);

  // Estado vazio
  if (!hasData) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Onde foi seu dinheiro
          </CardTitle>
          <CardDescription>
            Top categorias de gasto do mês em curso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ainda não há gastos registrados neste mês. Registrar despesas ajuda
            a enxergar o que consome seu orçamento e tomar decisões mais
            conscientes.
          </p>
          <Link to="/gastos">
            <Button size="sm" className="gap-1.5">
              <Receipt className="h-4 w-4" />
              Registrar despesa
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const trendIcon = (diff) => {
    if (diff === null) return { Icon: Minus, color: 'text-muted-foreground', label: 'novo' };
    if (diff > 10) return { Icon: TrendingUp, color: 'text-expense', label: `+${Math.round(diff)}% vs mês anterior` };
    if (diff < -10) return { Icon: TrendingDown, color: 'text-success', label: `${Math.round(diff)}% vs mês anterior` };
    return { Icon: Minus, color: 'text-muted-foreground', label: 'estável vs mês anterior' };
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Onde foi seu dinheiro
            </CardTitle>
            <CardDescription>
              Top categorias do mês em curso
            </CardDescription>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg md:text-xl font-bold tabular-nums">
              R$ {formatBRL(totalMonth)}
            </div>
            <p className="text-[11px] text-muted-foreground">total gasto</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2.5">
          {top.map((item, i) => {
            const t = trendIcon(item.diff);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.cor }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium truncate">
                      {item.nome}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums flex-shrink-0">
                      {Math.round(item.pct)}%
                    </span>
                  </div>
                  <div className="text-sm font-semibold tabular-nums flex-shrink-0">
                    R$ {formatBRL(item.valor)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden flex-1">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.cor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(item.pct, 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
                    />
                  </div>
                  <div
                    className={`flex items-center gap-0.5 text-[11px] ${t.color} flex-shrink-0 min-w-[90px] justify-end`}
                    title={t.label}
                  >
                    <t.Icon className="h-3 w-3" />
                    <span className="tabular-nums">
                      {item.diff === null
                        ? 'novo'
                        : `${item.diff > 0 ? '+' : ''}${Math.round(item.diff)}%`}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {highlight && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-expense/5 border border-expense/20">
            <TrendingUp className="h-4 w-4 text-expense mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">{highlight.nome}</span>{' '}
              subiu <span className="font-semibold text-expense">
                +{Math.round(highlight.diff)}%
              </span>{' '}
              em relação ao mês passado. Vale revisar se foi um evento pontual
              ou uma tendência.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-0.5">
          <Link to="/relatorios">
            <Button size="sm" variant="outline" className="gap-1">
              Ver análise completa
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

export { TopCategoriesCard };
