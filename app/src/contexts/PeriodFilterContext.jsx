import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import {
  normalizePeriodFilterFromStorage,
  migrateLegacyPeriodFilter,
  defaultPeriodFilter,
  shiftDateRangeByMonths,
} from '@/lib/periodFilter';

const STORAGE_KEY = 'lumify_period_filter';

const PeriodFilterContext = createContext(null);

function loadInitialFilter() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return normalizePeriodFilterFromStorage(JSON.parse(raw));
    }
  } catch {
    /* ignore */
  }
  const migrated = migrateLegacyPeriodFilter();
  if (migrated) return migrated;
  return defaultPeriodFilter();
}

export function PeriodFilterProvider({ children }) {
  const [filter, setFilter] = useState(loadInitialFilter);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filter));
    } catch {
      /* ignore */
    }
  }, [filter]);

  const setDateRange = useCallback((range) => {
    setFilter((f) => ({ ...f, dateRange: range }));
  }, []);

  const setMonth = useCallback((month) => {
    setFilter((f) => ({
      ...f,
      dateRange: undefined,
      periodType: 'monthly',
      month,
      year: f.year ?? new Date().getFullYear(),
    }));
  }, []);

  const setYear = useCallback((year) => {
    setFilter((f) => ({ ...f, dateRange: undefined, year }));
  }, []);

  const setPeriodType = useCallback((type) => {
    setFilter((f) => ({ ...f, periodType: type, dateRange: undefined }));
  }, []);

  const resetPeriod = useCallback(() => {
    setFilter(defaultPeriodFilter());
  }, []);

  const presetThisMonth = useCallback(() => {
    const n = new Date();
    setFilter({
      periodType: 'monthly',
      dateRange: undefined,
      month: n.getMonth(),
      year: n.getFullYear(),
    });
  }, []);

  const presetPreviousMonth = useCallback(() => {
    setFilter((f) => {
      const base = new Date();
      if (f.dateRange?.from) {
        const d = f.dateRange.from instanceof Date ? f.dateRange.from : new Date(f.dateRange.from);
        base.setFullYear(d.getFullYear(), d.getMonth(), 1);
      } else if (f.periodType === 'monthly') {
        base.setFullYear(f.year ?? base.getFullYear(), f.month ?? base.getMonth(), 1);
      } else if (f.periodType === 'yearly') {
        base.setFullYear(f.year ?? base.getFullYear(), base.getMonth(), 1);
      } else {
        base.setFullYear(f.year ?? base.getFullYear(), f.month ?? base.getMonth(), 1);
      }
      base.setMonth(base.getMonth() - 1);
      return {
        ...f,
        dateRange: undefined,
        periodType: 'monthly',
        month: base.getMonth(),
        year: base.getFullYear(),
      };
    });
  }, []);

  const presetThisYear = useCallback(() => {
    const y = new Date().getFullYear();
    setFilter({
      periodType: 'yearly',
      dateRange: undefined,
      year: y,
      month: new Date().getMonth(),
    });
  }, []);

  const stepPeriod = useCallback((delta) => {
    setFilter((f) => {
      if (f.dateRange?.from) {
        return {
          ...f,
          dateRange: shiftDateRangeByMonths(f.dateRange, delta),
        };
      }
      if (f.periodType === 'yearly') {
        return {
          ...f,
          year: (f.year ?? new Date().getFullYear()) + delta,
        };
      }
      let m = f.month ?? 0;
      let y = f.year ?? new Date().getFullYear();
      m += delta;
      if (m > 11) {
        m = 0;
        y += 1;
      }
      if (m < 0) {
        m = 11;
        y -= 1;
      }
      return {
        ...f,
        dateRange: undefined,
        periodType: 'monthly',
        month: m,
        year: y,
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      filter,
      setFilter,
      setDateRange,
      setMonth,
      setYear,
      setPeriodType,
      resetPeriod,
      presetThisMonth,
      presetPreviousMonth,
      presetThisYear,
      stepPeriod,
    }),
    [
      filter,
      setDateRange,
      setMonth,
      setYear,
      setPeriodType,
      resetPeriod,
      presetThisMonth,
      presetPreviousMonth,
      presetThisYear,
      stepPeriod,
    ]
  );

  return <PeriodFilterContext.Provider value={value}>{children}</PeriodFilterContext.Provider>;
}

export function usePeriodFilter() {
  const ctx = useContext(PeriodFilterContext);
  if (!ctx) {
    throw new Error('usePeriodFilter deve ser usado dentro de PeriodFilterProvider');
  }
  return ctx;
}
