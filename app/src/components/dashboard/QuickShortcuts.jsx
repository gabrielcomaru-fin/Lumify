import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Receipt, TrendingUp, BarChart3 } from 'lucide-react';

const shortcuts = [
  {
    to: '/receitas',
    label: 'Nova receita',
    description: 'Registrar entrada',
    icon: DollarSign,
    iconClass: 'text-income',
    bgClass: 'bg-income/10 group-hover:bg-income/15',
  },
  {
    to: '/gastos',
    label: 'Nova despesa',
    description: 'Registrar gasto',
    icon: Receipt,
    iconClass: 'text-expense',
    bgClass: 'bg-expense/10 group-hover:bg-expense/15',
  },
  {
    to: '/investimentos',
    label: 'Novo aporte',
    description: 'Investir agora',
    icon: TrendingUp,
    iconClass: 'text-primary',
    bgClass: 'bg-primary/10 group-hover:bg-primary/15',
  },
  {
    to: '/relatorios',
    label: 'Ver relatórios',
    description: 'Análises completas',
    icon: BarChart3,
    iconClass: 'text-info',
    bgClass: 'bg-info/10 group-hover:bg-info/15',
  },
];

const QuickShortcuts = memo(function QuickShortcuts() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
        Atalhos rápidos
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {shortcuts.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <Link
              to={item.to}
              className="group block rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200 p-4 h-full"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${item.bgClass}`}
              >
                <item.icon className={`h-5 w-5 ${item.iconClass}`} />
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold leading-tight">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  {item.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

export { QuickShortcuts };
