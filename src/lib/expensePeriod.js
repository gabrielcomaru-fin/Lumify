import { startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';

/**
 * Resolve o intervalo [startDate, endDate] do filtro de despesas (fim do dia em endDate).
 * @returns {{ startDate: Date, endDate: Date } | null}
 */
export function getExpensePeriodBounds(filter) {
  let startDate;
  let endDate;

  if (filter.dateRange && filter.dateRange.from) {
    startDate =
      filter.dateRange.from instanceof Date
        ? filter.dateRange.from
        : new Date(filter.dateRange.from);
    const toDate = filter.dateRange.to || filter.dateRange.from;
    endDate = toDate instanceof Date ? new Date(toDate) : new Date(toDate);
  } else if (filter.periodType === 'yearly' && filter.year != null) {
    startDate = startOfYear(new Date(filter.year, 0, 1));
    endDate = endOfYear(new Date(filter.year, 11, 31));
  } else if (
    filter.periodType === 'monthly' &&
    filter.month !== undefined &&
    filter.month !== null &&
    filter.year != null
  ) {
    startDate = startOfMonth(new Date(filter.year, filter.month, 1));
    endDate = endOfMonth(new Date(filter.year, filter.month, 1));
  } else {
    return null;
  }

  endDate = new Date(endDate);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
}

export function filterExpensesInPeriod(expenses, startDate, endDate) {
  return expenses.filter((expense) => {
    const expenseDate = parseISO(expense.data);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

/** Meses de calendário distintos cobertos pelo intervalo (mínimo 1). */
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
