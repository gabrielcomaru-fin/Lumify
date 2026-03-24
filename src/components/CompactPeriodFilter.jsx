import React, { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';

export function CompactPeriodFilter() {
  const {
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
  } = usePeriodFilter();

  const { periodType, dateRange, month, year } = filter;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [tempRange, setTempRange] = useState(dateRange);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => currentYear - i), [currentYear]);
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: new Date(0, i).toLocaleString('pt-BR', { month: 'short' }),
      })),
    []
  );

  const displayPeriodType = useMemo(() => (dateRange?.from ? 'custom' : periodType), [dateRange, periodType]);

  const ensureDate = (value) => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  useEffect(() => {
    if (isPopoverOpen) {
      if (dateRange?.from) {
        const fromDate = ensureDate(dateRange.from);
        const toDate = ensureDate(dateRange.to);
        setTempRange({
          from: fromDate,
          to: toDate,
        });
      } else {
        setTempRange(dateRange);
      }
    }
  }, [isPopoverOpen, dateRange]);

  const handleConfirmRange = () => {
    if (tempRange?.from) {
      setDateRange(tempRange);
    }
    setIsPopoverOpen(false);
  };

  const getDisplayText = () => {
    if (dateRange?.from) {
      const fromDate = ensureDate(dateRange.from);
      const toDate = ensureDate(dateRange.to);

      if (!fromDate) return 'Período';

      return toDate
        ? `${format(fromDate, 'dd/MM')} - ${format(toDate, 'dd/MM')}`
        : format(fromDate, 'dd/MM/yy');
    }

    if (periodType === 'monthly' && month !== undefined && year) {
      return `${months[month]?.label} ${year}`;
    }

    if (periodType === 'yearly' && year) {
      return year.toString();
    }

    return 'Período';
  };

  const showReset =
    Boolean(dateRange?.from) || (periodType !== 'monthly' && periodType !== 'yearly');

  return (
    <div className="flex flex-col gap-2 p-2 bg-muted/50 rounded-lg border border-border sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap items-center gap-1">
        <Button type="button" variant="secondary" size="sm" className="h-7 px-2 text-xs" onClick={presetThisMonth}>
          Este mês
        </Button>
        <Button type="button" variant="secondary" size="sm" className="h-7 px-2 text-xs" onClick={presetPreviousMonth}>
          Mês anterior
        </Button>
        <Button type="button" variant="secondary" size="sm" className="h-7 px-2 text-xs" onClick={presetThisYear}>
          Este ano
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden sm:block" />

        <Select value={displayPeriodType} onValueChange={setPeriodType}>
          <SelectTrigger className="w-[118px] h-8 text-xs border-0 bg-transparent shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={() => stepPeriod(-1)}
            title="Período anterior"
            aria-label="Período anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={() => stepPeriod(1)}
            title="Próximo período"
            aria-label="Próximo período"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {displayPeriodType === 'monthly' && (
          <>
            <Select value={month?.toString()} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-[76px] h-8 text-xs border-0 bg-transparent shadow-none">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year?.toString()} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[68px] h-8 text-xs border-0 bg-transparent shadow-none">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {displayPeriodType === 'yearly' && (
          <Select value={year?.toString()} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[76px] h-8 text-xs border-0 bg-transparent shadow-none">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {displayPeriodType === 'custom' && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {getDisplayText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <Calendar mode="range" selected={tempRange} onSelect={setTempRange} numberOfMonths={2} />
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsPopoverOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="default" size="sm" onClick={handleConfirmRange}>
                  Confirmar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {showReset && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            type="button"
            onClick={() => {
              resetPeriod();
              setTempRange(undefined);
            }}
            title="Voltar ao mês atual"
            aria-label="Voltar ao mês atual"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
