import React, { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { educationTips, getDailyTipIndex } from '@/lib/educationTips';

const FinancialEducationCard = memo(function FinancialEducationCard() {
  const initialIndex = useMemo(() => getDailyTipIndex(educationTips.length), []);
  const [index, setIndex] = useState(initialIndex);

  const tip = educationTips[index];

  const prev = () => setIndex((i) => (i - 1 + educationTips.length) % educationTips.length);
  const next = () => setIndex((i) => (i + 1) % educationTips.length);

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
              Educação Financeira
            </CardTitle>
            <CardDescription className="mt-1">
              Entenda um pouco mais sobre suas finanças a cada dia
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={prev}
              className="h-8 w-8 p-0"
              aria-label="Dica anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums min-w-[36px] text-center">
              {index + 1}/{educationTips.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={next}
              className="h-8 w-8 p-0"
              aria-label="Próxima dica"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={tip.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="inline-block text-[11px] font-medium uppercase tracking-wide text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mb-3">
              {tip.term}
            </div>
            <h3 className="text-base md:text-lg font-semibold leading-snug">
              {tip.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              {tip.body}
            </p>

            <div className="mt-4 pt-4 border-t border-border/60 flex items-start gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground flex-shrink-0 mt-0.5">
                Glossário
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">{tip.term}:</span>{' '}
                {tip.termDefinition}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-4 flex justify-end">
          <a
            href="https://lumify.app.br/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Ver mais conteúdo
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
});

export { FinancialEducationCard };
