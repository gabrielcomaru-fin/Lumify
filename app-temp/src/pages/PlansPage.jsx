import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const PLANS_CONFIG = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    description: 'Comece a organizar suas finanças, grátis e sem compromisso.',
    features: [
      'Controle de gastos básico',
      'Cadastro de 1 conta bancária',
      'Visão geral no dashboard',
      '1 meta de aporte simples',
    ],
    cta: 'Seu plano atual',
    isFree: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 9,90',
    priceSuffix: '/mês',
    description: 'Controle completo do seu mês: múltiplas contas, limites por categoria e metas reais.',
    features: [
      'Tudo do plano Free',
      'Múltiplas contas bancárias',
      'Metas de aporte personalizadas',
      'Teto de gastos por categoria',
      'Relatórios e gráficos no app',
      'Dicas financeiras automáticas',
    ],
    cta: 'Fazer Upgrade',
    isFree: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 19,90',
    priceSuffix: '/mês',
    description: 'Planejamento de longo prazo: projeções avançadas, simulador completo e relatórios profissionais.',
    features: [
      'Tudo do plano Pro',
      'Projeções de investimento avançadas',
      'Simulador de juros compostos detalhado',
      'Relatórios completos (PDF/Excel)',
      'Suporte prioritário',
    ],
    cta: 'Fazer Upgrade',
    isFree: false,
  },
];

export function PlansPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { plan, loadSubscription } = useSubscription();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success') {
      toast({
        title: 'Assinatura ativada',
        description: 'Seu plano foi atualizado. Aproveite os novos recursos!',
      });
      loadSubscription(user?.id);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (status === 'cancel') {
      toast({
        variant: 'destructive',
        title: 'Checkout cancelado',
        description: 'Você pode assinar a qualquer momento.',
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user?.id, loadSubscription, toast]);

  const handleUpgradeClick = async (planId) => {
    if (planId === 'free') return;
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Faça login',
        description: 'É preciso estar logado para assinar.',
      });
      return;
    }

    try {
      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: planId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'Erro ao iniciar checkout',
          description: data.message || data.error || 'Tente novamente.',
        });
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Resposta inválida do servidor.',
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast({
        variant: 'destructive',
        title: 'Erro de conexão',
        description: 'Não foi possível abrir o checkout. Tente novamente.',
      });
    }
  };

  const isCurrentPlan = (planId) => {
    if (planId === 'free') return plan === 'free';
    if (planId === 'pro') return plan === 'pro' || plan === 'premium';
    if (planId === 'premium') return plan === 'premium';
    return false;
  };

  return (
    <>
      <Helmet>
        <title>Planos - Lumify</title>
        <meta name="description" content="Planos Free, Pro e Premium. Comece grátis e evolua quando quiser." />
      </Helmet>
      <div className="space-y-4 md:space-y-5 page-top">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Nossos Planos</h1>
          <p className="text-muted-foreground mt-2">Comece grátis, evolua quando quiser. Escolha o plano ideal para sua jornada financeira.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {PLANS_CONFIG.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`flex flex-col h-full ${p.id === 'pro' ? 'border-primary ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {p.id === 'pro' && <Star className="text-primary w-5 h-5" />}
                    {p.name}
                  </CardTitle>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{p.price}</span>
                    {p.priceSuffix && <span className="text-muted-foreground">{p.priceSuffix}</span>}
                  </div>
                  <ul className="space-y-3">
                    {p.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={isCurrentPlan(p.id)}
                    onClick={() => handleUpgradeClick(p.id)}
                    variant={p.id === 'pro' ? 'default' : 'outline'}
                  >
                    {isCurrentPlan(p.id) ? 'Seu plano atual' : p.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
