import React, { useMemo, useState } from 'react';
import { parseISO } from 'date-fns';
import { Clock, ArrowUpRight } from 'lucide-react';

const formatDateTime = (d) => {
  try { return new Date(d).toLocaleString('pt-BR'); } catch { return d; }
};

export default function PatrimonyTimeline({ accounts = [], investments = [], accountMap = {}, categoryMap = {}, pageSize = 10 }) {
  const events = useMemo(() => {
    const ev = [];

    accounts.forEach(acc => {
      if (!acc.created_at || !acc.updated_at) return;
      let created = null; let updated = null;
      try { created = parseISO(acc.created_at); } catch {}
      try { updated = parseISO(acc.updated_at); } catch {}
      if (created && updated && updated.getTime() > created.getTime()) {
        ev.push({
          id: `ajuste-${acc.id}-${updated.toISOString()}`,
          type: 'ajuste',
          timestamp: updated.getTime(),
          iso: updated.toISOString(),
          institutionId: acc.id,
          institutionName: acc.nome_banco || 'Instituição',
          value: Number(acc.saldo) || 0,
          description: 'Ajuste manual de saldo'
        });
      }
    });

    investments.forEach(inv => {
      const valor = Number(inv.valor_aporte || 0);
      if (valor === 0) return;
      let ts = null;
      try { if (inv.created_at) ts = parseISO(inv.created_at); } catch {}
      if (!ts && inv.data) {
        try { ts = parseISO(inv.data + 'T00:00:00'); } catch {}
      }
      const instName = inv.instituicao_id ? (accountMap[inv.instituicao_id]?.nome_banco || 'Instituição') : 'Sem Instituição';
      const catName = inv.categoria_id ? (categoryMap[inv.categoria_id]?.nome || '') : '';

      ev.push({
        id: `aporte-${inv.id}`,
        type: 'aporte',
        timestamp: ts ? ts.getTime() : 0,
        iso: ts ? ts.toISOString() : (inv.data || null),
        institutionId: inv.instituicao_id,
        institutionName: instName,
        value: valor,
        description: `Aporte${catName ? ' • ' + catName : ''}`
      });
    });

    return ev.sort((a, b) => b.timestamp - a.timestamp);
  }, [accounts, investments, accountMap, categoryMap]);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
  const pageEvents = events.slice((page - 1) * pageSize, page * pageSize);

  if (!events.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Nenhum aporte ou ajuste identificado recentemente.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {pageEvents.map((e) => (
          <li key={e.id} className="mb-8 last:mb-0">
            <div className="relative pb-8">
              <span className="absolute left-2 -ml-px top-1 h-full w-0.5 bg-muted" aria-hidden="true" />
              <div className="relative flex items-start gap-3">
                <div className="z-10 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mt-1">
                  {e.type === 'ajuste' ? <Clock className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{formatDateTime(e.iso)}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{e.type === 'ajuste' ? 'Ajuste de Saldo' : 'Aporte'}</p>
                      <p className="text-sm text-muted-foreground">{e.description} • {e.institutionName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(e.value)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">Página {page} de {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border bg-white"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >Anterior</button>
            <button
              className="px-3 py-1 rounded border bg-white"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
}
