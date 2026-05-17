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
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/contexts/FinanceDataContext';
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  parseISO,
  differenceInDays,
  format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatBRL = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PendingBillsCard = memo(function PendingBillsCard() {
  const { expenses, categories } = useFinance();

  const { pendingList, totalPending, count, totalMonth, paidPct } =
    useMemo(() => {
      const today = new Date();
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      const currentMonth = expenses.filter((e) => {
        const d = parseISO(e.data);
        return d >= monthStart && d <= monthEnd;
      });

      const pending = currentMonth
        .filter((e) => !e.pago)
        .sort((a, b) => b.valor - a.valor);

      const totalPend = pending.reduce((s, e) => s + e.valor, 0);
      const totalMo = currentMonth.reduce((s, e) => s + e.valor, 0);
      const paidSum = currentMonth
        .filter((e) => e.pago)
        .reduce((s, e) => s + e.valor, 0);

      const list = pending.slice(0, 3).map((e) => {
        const cat = categories.find((c) => c.id === e.categoria_id);
        return {
          id: e.id,
          descricao: e.descricao || 'Sem descrição',
          valor: e.valor,
          data: e.data,
          categoria: cat?.nome || 'Sem categoria',
          cor: cat?.cor || '#64748b',
        };
      });

      return {
        pendingList: list,
        totalPending: totalPend,
        count: pending.length,
        totalMonth: totalMo,
        paidPct: totalMo > 0 ? (paidSum / totalMo) * 100 : 0,
      };
    }, [expenses, categories]);

  const today = new Date();
  const monthEnd = endOfMonth(today);
  const daysToMonthEnd = Math.max(0, differenceInDays(monthEnd, today));

  // Estado vazio: nenhuma despesa pendente
  if (count === 0) {
    return (
      <Card className="border-l-4 border-l-success h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Contas em dia
          </CardTitle>
          <CardDescription>
            {totalMonth > 0
              ? 'Nenhuma conta pendente neste mês'
              : 'Ainda não há gastos registrados neste mês'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {totalMonth > 0 ? (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Você já quitou <strong>R$ {formatBRL(totalMonth)}</strong> em
                compromissos neste mês. Evitar juros e atrasos é um dos hábitos
                mais poderosos para a saúde financeira.
              </p>
              <Link to="/gastos">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Receipt className="h-4 w-4" />
                  Ver histórico
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Registrar seus gastos ajuda a enxergar para onde o dinheiro vai
                e ficar no controle do orçamento.
              </p>
              <Link to="/gastos">
                <Button size="sm" className="gap-1.5">
                  <Receipt className="h-4 w-4" />
                  Registrar despesa
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  const urgent = daysToMonthEnd <= 5;

  return (
    <Card
      className={`border-l-4 h-full ${
        urgent ? 'border-l-warning' : 'border-l-expense'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <AlertCircle
                className={`h-5 w-5 ${
                  urgent ? 'text-warning' : 'text-expense'
                }`}
              />
              Contas em aberto
            </CardTitle>
            <CardDescription>
              {count} {count === 1 ? 'conta pendente' : 'contas pendentes'}
              {urgent
                ? daysToMonthEnd === 0
                  ? ' · último dia do mês'
                  : ` · faltam ${daysToMonthEnd} dias`
                : ''}
            </CardDescription>
          </div>
          <div className="text-right flex-shrink-0">
            <div
              className={`text-xl md:text-2xl font-bold tabular-nums ${
                urgent ? 'text-warning' : 'text-expense'
              }`}
            >
              R$ {formatBRL(totalPending)}
            </div>
            <p className="text-[11px] text-muted-foreground">em aberto</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Mini barra de progresso: % já pago do mês */}
        {totalMonth > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progresso do mês</span>
              <span className="tabular-nums">
                {Math.round(paidPct)}% pago
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-success"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(paidPct, 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Lista top 3 contas pendentes */}
        <div className="space-y-1.5">
          {pendingList.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.cor }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate leading-tight">
                    {item.descricao}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.categoria} ·{' '}
                    {format(parseISO(item.data), "dd 'de' MMM", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="text-sm font-semibold tabular-nums flex-shrink-0">
                R$ {formatBRL(item.valor)}
              </div>
            </motion.div>
          ))}

          {count > 3 && (
            <p className="text-[11px] text-muted-foreground pl-2 pt-0.5">
              + {count - 3}{' '}
              {count - 3 === 1 ? 'outra pendente' : 'outras pendentes'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          {urgent && (
            <Badge variant="outline" className="text-[11px] border-warning/40 text-warning">
              Atenção ao prazo
            </Badge>
          )}
          <Link to="/gastos" className="ml-auto">
            <Button size="sm" variant="outline" className="gap-1">
              Quitar contas
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

export { PendingBillsCard };
