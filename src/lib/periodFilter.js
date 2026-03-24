import { startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LEGACY_KEYS = ['filter_expensesPage', 'filter_incomesPage', 'filter_investmentsPage'];

function ensureDate(value) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Normaliza datas vindas do JSON (localStorage) para objetos Date.
 */
export function normalizePeriodFilterFromStorage(raw) {
  if (!raw || typeof raw !== 'object') {
    return defaultPeriodFilter();
  }
  const next = { ...raw };
  if (next.dateRange?.from) {
    const from = ensureDate(next.dateRange.from);
    const to = next.dateRange.to ? ensureDate(next.dateRange.to) : null;
    next.dateRange = from ? { from, to: to || from } : undefined;
  } else {
    next.dateRange = undefined;
  }
  if (typeof next.month !== 'number' || next.month < 0 || next.month > 11) {
    next.month = new Date().getMonth();
  }
  if (typeof next.year !== 'number' || !Number.isFinite(next.year)) {
    next.year = new Date().getFullYear();
  }
  if (!['monthly', 'yearly', 'custom'].includes(next.periodType)) {
    next.periodType = 'monthly';
  }
  return next;
}

export function defaultPeriodFilter() {
  const n = new Date();
  return {
    periodType: 'monthly',
    dateRange: undefined,
    month: n.getMonth(),
    year: n.getFullYear(),
  };
}

/**
 * Migra a primeira chave legada encontrada para o novo formato.
 */
export function migrateLegacyPeriodFilter() {
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      return normalizePeriodFilterFromStorage(parsed);
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Resolve [startDate, endDate] com fim do dia em endDate.
 * Se o filtro for inválido, usa o mês civil atual (fallback único e previsível).
 */
export function getPeriodBounds(filter) {
  let startDate;
  let endDate;

  if (filter?.dateRange && filter.dateRange.from) {
    startDate =
      filter.dateRange.from instanceof Date
        ? filter.dateRange.from
        : new Date(filter.dateRange.from);
    const toDate = filter.dateRange.to || filter.dateRange.from;
    endDate = toDate instanceof Date ? new Date(toDate) : new Date(toDate);
  } else if (filter?.periodType === 'yearly' && filter.year != null) {
    startDate = startOfYear(new Date(filter.year, 0, 1));
    endDate = endOfYear(new Date(filter.year, 11, 31));
  } else if (
    filter?.periodType === 'monthly' &&
    filter.month !== undefined &&
    filter.month !== null &&
    filter.year != null
  ) {
    startDate = startOfMonth(new Date(filter.year, filter.month, 1));
    endDate = endOfMonth(new Date(filter.year, filter.month, 1));
  } else {
    const now = new Date();
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  }

  endDate = new Date(endDate);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
}

/** Alias histórico (despesas / relatórios). */
export function getExpensePeriodBounds(filter) {
  return getPeriodBounds(filter);
}

export function filterExpensesInPeriod(expenses, startDate, endDate) {
  return expenses.filter((expense) => {
    const expenseDate = parseISO(expense.data);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

export function countDistinctCalendarMonthsInRange(startDate, endDate) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  let n = 0;
  const d = new Date(start);
  while (d <= end) {
    n += 1;
    d.setMonth(d.getMonth() + 1);
  }
  return Math.max(1, n);
}

export function getPeriodShortLabel(filter, startDate, endDate) {
  if (filter?.dateRange?.from) {
    const from = ensureDate(filter.dateRange.from);
    const to = ensureDate(filter.dateRange.to || filter.dateRange.from);
    if (!from) return 'Período';
    return to && to.getTime() !== from.getTime()
      ? `${format(from, 'dd/MM/yyyy')} — ${format(to, 'dd/MM/yyyy')}`
      : format(from, 'dd/MM/yyyy');
  }
  if (filter?.periodType === 'yearly' && filter.year != null) {
    return `Ano ${filter.year}`;
  }
  if (filter?.month !== undefined && filter?.year != null) {
    return format(new Date(filter.year, filter.month, 1), 'MMM/yyyy', { locale: ptBR });
  }
  return `${format(startDate, 'dd/MM/yyyy')} — ${format(endDate, 'dd/MM/yyyy')}`;
}

/**
 * Desloca intervalo personalizado em meses (para ◀ / ▶ em modo custom).
 */
export function shiftDateRangeByMonths(dateRange, delta) {
  if (!dateRange?.from) return dateRange;
  const from = ensureDate(dateRange.from);
  const to = ensureDate(dateRange.to || dateRange.from);
  if (!from || !to) return dateRange;
  return {
    from: addMonths(from, delta),
    to: addMonths(to, delta),
  };
}
