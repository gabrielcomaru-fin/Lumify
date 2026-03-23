import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Gauge } from 'lucide-react';

function parseCategoryLimite(limite) {
  if (limite == null || limite === '') return 0;
  if (typeof limite === 'number') return limite > 0 ? limite : 0;
  const n = parseFloat(String(limite).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export const CategoryBudgetBars = memo(function CategoryBudgetBars({
  expenseCategories,
  expensesInPeriod,
  monthsInPeriod,
  currencyFormatter,
  className,
}) {
  const rows = useMemo(() => {
    const withLimit = expenseCategories.filter((c) => parseCategoryLimite(c.limite) > 0);
    const spentByCat = {};
    expensesInPeriod.forEach((exp) => {
      const id = exp.categoria_id;
      if (!id) return;
      spentByCat[id] = (spentByCat[id] || 0) + (Number(exp.valor) || 0);
    });

    return withLimit
      .map((cat) => {
        const monthlyLimit = parseCategoryLimite(cat.limite);
        const cap = monthlyLimit * monthsInPeriod;
        const spent = spentByCat[cat.id] || 0;
        const pct = cap > 0 ? (spent / cap) * 100 : 0;
        let tone = 'default';
        if (pct >= 100) tone = 'over';
        else if (pct >= 80) tone = 'warn';
        return {
          id: cat.id,
          nome: cat.nome,
          cor: cat.cor,
          spent,
          cap,
          pct,
          tone,
        };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [expenseCategories, expensesInPeriod, monthsInPeriod]);

  if (rows.length === 0) {
    return (
      <Card className={cn('h-full flex flex-col lg:min-h-[28rem]', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-muted-foreground" />
            Tetos por categoria
          </CardTitle>
          <CardDescription>
            Nenhuma categoria de gasto com teto definido.{' '}
            <Link to="/configuracoes" className="text-primary underline font-medium hover:no-underline">
              Configurações
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center text-center text-sm text-muted-foreground py-8">
          Defina limites nas categorias de gasto para acompanhar o uso aqui.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full flex flex-col lg:min-h-[28rem]', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-muted-foreground" />
          Tetos por categoria
        </CardTitle>
        <CardDescription>
          Uso do teto no período selecionado (teto mensal × {monthsInPeriod}{' '}
          {monthsInPeriod === 1 ? 'mês' : 'meses'}).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto min-h-0">
        {rows.map((row) => (
          <div key={row.id} className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-sm">
              <span className="font-medium">{row.nome}</span>
              <span className="text-muted-foreground tabular-nums">
                {currencyFormatter.format(row.spent)} / {currencyFormatter.format(row.cap)}
                <span
                  className={
                    row.tone === 'over'
                      ? ' text-destructive font-medium ml-1'
                      : row.tone === 'warn'
                        ? ' text-amber-600 dark:text-amber-500 font-medium ml-1'
                        : ' ml-1'
                  }
                >
                  ({Math.round(row.pct)}%)
                </span>
              </span>
            </div>
            <Progress
              value={Math.min(row.pct, 100)}
              className={
                row.tone === 'over'
                  ? 'h-2 [&>*]:bg-destructive'
                  : row.tone === 'warn'
                    ? 'h-2 [&>*]:bg-amber-500'
                    : 'h-2'
              }
            />
            {row.tone === 'over' && (
              <p className="text-xs text-destructive">Acima do teto neste período.</p>
            )}
            {row.tone === 'warn' && row.pct < 100 && (
              <p className="text-xs text-amber-600 dark:text-amber-500">Próximo do limite (80% ou mais).</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
});
