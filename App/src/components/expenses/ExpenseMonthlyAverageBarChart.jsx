import React, { memo, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { endOfMonth, format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

/** Mesmas cores de SpendingPatternsChart: dias úteis (#3b82f6) e fim de semana (#f59e0b). */
const COLOR_BELOW_OR_EQUAL = '#3b82f6';
const COLOR_ABOVE = '#f59e0b';
const COLOR_NEUTRAL = '#94a3b8';

function sumExpensesInMonth(expenses, year, month) {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(new Date(year, month, 1));
  return expenses.reduce((sum, exp) => {
    const d = parseISO(exp.data);
    if (Number.isNaN(d.getTime())) return sum;
    if (d >= start && d <= end) return sum + (Number(exp.valor) || 0);
    return sum;
  }, 0);
}

/** Média dos totais mensais em que houve pelo menos um lançamento com valor > 0. */
export function computeHistoricMonthlyAverage(expenses) {
  const byMonth = {};
  for (const exp of expenses) {
    const v = Number(exp.valor) || 0;
    if (v <= 0) continue;
    const d = parseISO(exp.data);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    byMonth[key] = (byMonth[key] || 0) + v;
  }
  const totals = Object.values(byMonth);
  if (totals.length === 0) return 0;
  return totals.reduce((a, b) => a + b, 0) / totals.length;
}

export const ExpenseMonthlyAverageBarChart = memo(function ExpenseMonthlyAverageBarChart({
  expenses,
  monthWindow = 6,
  anchoredToFilter,
  anchorYear,
  anchorMonth,
  currencyFormatter,
}) {
  const historicAverage = useMemo(() => computeHistoricMonthlyAverage(expenses), [expenses]);

  const chartData = useMemo(() => {
    const end =
      anchoredToFilter && anchorYear != null && anchorMonth != null && anchorMonth !== undefined
        ? endOfMonth(new Date(anchorYear, anchorMonth, 1))
        : endOfMonth(new Date());

    const rows = [];
    for (let i = monthWindow - 1; i >= 0; i -= 1) {
      const d = subMonths(end, i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const total = sumExpensesInMonth(expenses, y, m);
      let fill = COLOR_NEUTRAL;
      if (historicAverage > 0) {
        if (total > historicAverage) fill = COLOR_ABOVE;
        else fill = COLOR_BELOW_OR_EQUAL;
      } else if (total > 0) {
        fill = COLOR_BELOW_OR_EQUAL;
      }
      rows.push({
        label: format(d, 'MMM/yy', { locale: ptBR }),
        total,
        fill,
        year: y,
        month: m,
      });
    }
    return rows;
  }, [expenses, historicAverage, monthWindow, anchoredToFilter, anchorYear, anchorMonth]);

  const insight = useMemo(() => {
    if (!expenses.length) {
      return {
        title: 'Sem dados para comparar',
        body: 'Adicione despesas para ver os últimos meses e comparar com sua média histórica.',
      };
    }
    if (historicAverage <= 0) {
      return {
        title: 'Média histórica ainda não disponível',
        body: 'É preciso pelo menos um mês com gastos registrados para calcular a média e colorir as barras.',
      };
    }

    const spentInWindow = chartData.some((r) => r.total > 0);
    if (!spentInWindow) {
      return {
        title: 'Nenhum gasto nesta janela',
        body: `Sua média histórica é ${currencyFormatter.format(historicAverage)}. Nos últimos ${chartData.length} meses exibidos ainda não há lançamentos; o gráfico compara meses vazios com essa referência.`,
      };
    }

    const above = chartData.filter((r) => r.total > historicAverage).length;
    const onOrBelow = chartData.filter((r) => r.total > 0 && r.total <= historicAverage).length;

    let body = `Sua média mensal (considerando só meses em que houve gasto) é ${currencyFormatter.format(historicAverage)}. `;
    body += `Nesta janela de ${chartData.length} meses, ${above} ${above === 1 ? 'ficou' : 'ficaram'} acima da média`;
    if (onOrBelow > 0) {
      body += ` e ${onOrBelow} ${onOrBelow === 1 ? 'ficou' : 'ficaram'} na média ou abaixo.`;
    } else {
      body += '.';
    }

    if (anchoredToFilter && anchorYear != null && anchorMonth != null) {
      const sel = chartData.find((r) => r.year === anchorYear && r.month === anchorMonth);
      if (sel && historicAverage > 0) {
        const diffPct = ((sel.total - historicAverage) / historicAverage) * 100;
        if (sel.total > historicAverage) {
          body += ` O mês selecionado está ${diffPct.toFixed(1)}% acima da média.`;
        } else if (sel.total > 0) {
          body += ` O mês selecionado está ${Math.abs(diffPct).toFixed(1)}% abaixo da média.`;
        } else {
          body += ' No mês selecionado ainda não há gastos registrados.';
        }
      }
    }

    return {
      title:
        above > onOrBelow
          ? 'Atenção: vários meses acima da média'
          : onOrBelow >= above
            ? 'Padrão relativamente controlado'
            : 'Gastos mês a mês',
      body,
    };
  }, [
    expenses.length,
    historicAverage,
    chartData,
    anchoredToFilter,
    anchorYear,
    anchorMonth,
    currencyFormatter,
  ]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    const vs =
      historicAverage > 0
        ? row.total > historicAverage
          ? 'Acima da média histórica'
          : row.total > 0
            ? 'Na média ou abaixo'
            : 'Sem gastos'
        : '';
    return (
      <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-md">
        <p className="font-medium capitalize">{row.label}</p>
        <p className="text-muted-foreground">{currencyFormatter.format(row.total)}</p>
        {vs && <p className="text-xs text-muted-foreground mt-1">{vs}</p>}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          Gastos mês a mês vs média histórica
        </CardTitle>
        <CardDescription className="space-y-2">
          <p>
            Últimos {chartData.length} meses. Barras azuis: na média ou abaixo (como dias úteis no gráfico da semana).
            Laranja: acima da média (mesmo destaque do fim de semana). Linha cinza contínua: média histórica.
          </p>
          <p className="text-foreground font-medium leading-snug">{insight.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => {
                  if (value === 0) return 'R$ 0';
                  if (Math.abs(value) < 1000) return `R$ ${Math.round(value)}`;
                  return `R$ ${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              {historicAverage > 0 && (
                <ReferenceLine y={historicAverage} stroke="#94a3b8" strokeWidth={1.5} />
              )}
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={`${entry.year}-${entry.month}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {historicAverage > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Média histórica (meses com gasto): {currencyFormatter.format(historicAverage)}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
