import { useMemo } from 'react';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';
import { getPeriodBounds, getPeriodShortLabel } from '@/lib/periodFilter';

/**
 * Intervalo resolvido do filtro global + rótulo curto para subtítulos e exportações.
 */
export function usePeriodBounds() {
  const { filter } = usePeriodFilter();
  return useMemo(() => {
    const { startDate, endDate } = getPeriodBounds(filter);
    const label = getPeriodShortLabel(filter, startDate, endDate);
    return { startDate, endDate, label, filter };
  }, [filter]);
}
