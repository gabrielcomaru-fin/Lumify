"use client";

import { useState } from "react";

type CalcState = {
  initialAmount: string;
  monthlyContribution: string;
  annualRate: string;
  years: string;
};

type Result = {
  total: number;
  totalContributed: number;
  earnings: number;
};

function parseCurrency(value: string | number): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() === "") return 0;
  return parseFloat(String(value).replace(/\./g, "").replace(",", "."));
}

export function CompoundInterestCalculator() {
  const [calcData, setCalcData] = useState<CalcState>({
    initialAmount: "",
    monthlyContribution: "",
    annualRate: "10",
    years: "10",
  });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    setError(null);
    const initial = parseCurrency(calcData.initialAmount);
    const monthly = parseCurrency(calcData.monthlyContribution);
    const rate = parseFloat(calcData.annualRate) / 100 / 12;
    const years = parseInt(calcData.years, 10);
    const months = years * 12;

    if (Number.isNaN(rate) || Number.isNaN(months) || months <= 0) {
      setResult(null);
      setError("Informe uma taxa válida e um período em anos maior que zero.");
      return;
    }

    let total = initial;
    for (let i = 0; i < months; i++) {
      total = total * (1 + rate) + monthly;
    }

    const totalContributed = initial + monthly * months;
    const earnings = total - totalContributed;

    setResult({
      total,
      totalContributed,
      earnings,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-lumify-ink shadow-sm outline-none transition focus:border-lumify-blue focus:ring-2 focus:ring-lumify-blue/20";

  const labelClass =
    "whitespace-nowrap text-sm font-medium text-lumify-ink";

  return (
    <div
      className="not-prose my-10 rounded-2xl border border-slate-200 bg-lumify-muted/40 p-6 shadow-sm md:p-8"
      data-component="compound-calculator"
    >
      <h3 className="text-lg font-semibold text-lumify-navy md:text-xl">
        Simulador de juros compostos
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Projeção ilustrativa: aportes no fim de cada mês e taxa fixa. Não
        substitui análise de risco nem cenários reais de mercado.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="calc-initial" className={labelClass}>
            Valor inicial (R$)
          </label>
          <input
            id="calc-initial"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            autoComplete="off"
            className={inputClass}
            value={calcData.initialAmount}
            onChange={(e) =>
              setCalcData({ ...calcData, initialAmount: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="calc-monthly" className={labelClass}>
            Aporte mensal (R$)
          </label>
          <input
            id="calc-monthly"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            autoComplete="off"
            className={inputClass}
            value={calcData.monthlyContribution}
            onChange={(e) =>
              setCalcData({ ...calcData, monthlyContribution: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="calc-rate" className={labelClass}>
            Rendimento anual (%)
          </label>
          <input
            id="calc-rate"
            type="number"
            step="any"
            className={inputClass}
            value={calcData.annualRate}
            onChange={(e) =>
              setCalcData({ ...calcData, annualRate: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="calc-years" className={labelClass}>
            Período (anos)
          </label>
          <input
            id="calc-years"
            type="number"
            min={1}
            step={1}
            className={inputClass}
            value={calcData.years}
            onChange={(e) =>
              setCalcData({ ...calcData, years: e.target.value })
            }
          />
        </div>
      </div>

      <button
        type="button"
        onClick={calculate}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-lumify-navy to-lumify-blue px-4 py-3 text-sm font-semibold text-white shadow-md shadow-lumify-blue/25 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumify-blue sm:w-auto"
      >
        Calcular projeção
      </button>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total acumulado
            </p>
            <p className="mt-2 text-xl font-bold text-lumify-blue">
              {result.total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total aportado
            </p>
            <p className="mt-2 text-xl font-bold text-lumify-ink">
              {result.totalContributed.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Juros acumulados
            </p>
            <p className="mt-2 text-xl font-bold text-emerald-600">
              {result.earnings.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
