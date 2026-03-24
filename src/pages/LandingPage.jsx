import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  DollarSign, BarChart3, Target, ShieldCheck, Star, TrendingUp, 
  PiggyBank, AlertCircle, Zap, Award, LineChart, Calculator, 
  Lock, Smartphone, Lightbulb, ArrowRight, CheckCircle2,
  Flame, Eye, Settings, Download, Bell, Trophy
} from 'lucide-react';

export function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description: 'KPIs personalizados, health score e dicas automáticas com modo focus simplificado',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: PiggyBank,
      title: 'Gestão de Gastos',
      description: 'Categorize despesas, defina limites e importe dados bancários via OFX',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Acompanhamento de Investimentos',
      description: 'Registre aportes, acompanhe crescimento e organize por instituição',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Metas e Planejamento',
      description: 'Defina objetivos financeiros e acompanhe o progresso em tempo real',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: LineChart,
      title: 'Relatórios Avançados com IA',
      description: 'Análise de cenários, benchmarking, insights automáticos e previsões',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Calculator,
      title: 'Calculadoras de Projeção',
      description: 'Simule juros compostos e projete patrimônio futuro com volatilidade',
      color: 'from-rose-500 to-orange-500'
    },
    {
      icon: Award,
      title: 'Gamificação',
      description: 'Ganhe pontos, desbloqueie badges e mantenha streaks diários de hábitos',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: Bell,
      title: 'Alertas Inteligentes',
      description: 'Notificações proativas sobre liquidez, poupança e oportunidades',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  const benefits = [
    'Sem publicidades ou rastreamento',
    'Dados sempre seus (Supabase)',
    'Funciona offline com cache inteligente',
    'Interface mobile-first responsiva',
    'Acessível e em conformidade WCAG',
    'Exportação em PDF, CSV e JSON'
  ];

  const metrics = [
    { value: '10+', label: 'Funcionalidades principais' },
    { value: '50+', label: 'Tipos de gráficos e análises' },
    { value: '100%', label: 'Dados encriptados' },
    { value: '0', label: 'Taxa de setup' }
  ];

  return (
    <>
      <Helmet>
        <title>Lumify - Controle Financeiro Inteligente | Dashboards, Investimentos e IA</title>
        <meta name="description" content="Lumify: plataforma completa de gestão financeira pessoal. Controle gastos, acompanhe investimentos, crie projeções com IA, ganhe pontos e atinja suas metas." />
        <meta name="keywords" content="Lumify, controle financeiro, finanças pessoais, investimentos, orçamento, dashboards, IA, relatórios, metas, patrimônio, gamificação" />
        <meta property="og:title" content="Lumify - Seu Controle Financeiro Pessoal Inteligente" />
        <meta property="og:description" content="Organize gastos, acompanhe investimentos e projete metas com dashboards claros e insights em tempo real." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Lumify - Controle Financeiro Inteligente" />
        <meta name="twitter:description" content="Gestão completa de finanças pessoais com IA, relatórios avançados e gamificação." />
        <meta name="twitter:image" content="/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Lumify',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          description: 'Plataforma de gestão financeira pessoal com IA, investimentos, dashboards e gamificação.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '124' }
        })}</script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 overflow-hidden">
        
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-muted/40">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="h-10 w-10 bg-gradient-to-br from-primary via-primary to-info rounded-lg flex items-center justify-center shadow-md">
                  <DollarSign className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">Lumify</span>
              </Link>
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="hidden sm:inline-flex">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button className="shadow-lg">Começar Grátis</Button>
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4">
          
          {/* HERO SECTION */}
          <motion.section
            className="py-20 md:py-32 text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-primary/5 border-primary/20 mb-8">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Confiado por milhares de brasileiros</span>
            </motion.div>

            <motion.h1 
              variants={fadeIn}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
            >
              Seu <span className="bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent">controle financeiro</span> simplificado
            </motion.h1>

            <motion.p 
              variants={fadeIn}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Organize gastos, acompanhe investimentos, crie projeções com IA e atinja suas metas financeiras em uma plataforma moderna, segura e intuitiva.
            </motion.p>

            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Link to="/register">
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow duration-200">
                  Começar Grátis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-2">
                  Ver Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Cancele quando quiser</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Dados sempre seus</span>
              </div>
            </motion.div>
          </motion.section>

          {/* METRICS */}
          <motion.section
            className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-muted/40"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {metrics.map((metric, idx) => (
              <motion.div key={idx} variants={fadeIn} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{metric.value}</p>
                <p className="text-sm text-muted-foreground mt-2">{metric.label}</p>
              </motion.div>
            ))}
          </motion.section>

          {/* FEATURES GRID */}
          <motion.section
            className="py-20"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-bold mb-4">
                Tudo que você precisa em um lugar
              </motion.h2>
              <motion.p variants={fadeIn} className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Funcionalidades poderosas e intuitivas para transformar sua relação com dinheiro
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={fadeIn}
                    className="group p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer"
                  >
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-4 text-white group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* FEATURES DETAILED SECTION */}
          <motion.section
            className="py-20 border-t border-muted/40"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-bold mb-16 text-center">
              Funcionalidades que crescem com você
            </motion.h2>

            {/* Feature 1: Dashboard */}
            <motion.div variants={fadeIn} className="mb-20">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    Dashboard em Tempo Real
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>KPIs personalizados e dados consolidados</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Health Score de saúde financeira 0-100</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Comparação de período automática</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Modo Focus para interface simplificada</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Dicas e insights inteligentes automáticos</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-xl border bg-card p-8 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-muted-foreground">Patrimônio Total</span>
                      <span className="text-2xl font-bold">R$ 52.480</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-muted-foreground">Taxa de Poupança</span>
                      <span className="text-xl font-semibold text-green-500">28%</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-muted-foreground">Saúde Financeira</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold text-primary">72/100</span>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Gestão Completa */}
            <motion.div variants={fadeIn} className="mb-20">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="rounded-xl border bg-card p-8 shadow-lg order-2 md:order-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                      <span>Despesas do mês</span>
                      <span className="font-semibold">R$ 3.200</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                      <span>Investimentos</span>
                      <span className="font-semibold text-primary">R$ 2.500</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                      <span>Renda</span>
                      <span className="font-semibold">R$ 5.800</span>
                    </div>
                    <div className="h-px bg-muted my-4" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Categorias</p>
                        <p className="font-bold">12</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Contas</p>
                        <p className="font-bold">5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Transações</p>
                        <p className="font-bold">143</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Settings className="h-8 w-8 text-primary" />
                    Gestão Completa
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Registro de gastos com categorias</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Acompanhamento de investimentos</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Múltiplas contas bancárias</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Registro de renda e fontes</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Importação OFX para transferência de dados</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: IA e Relatórios */}
            <motion.div variants={fadeIn}>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Lightbulb className="h-8 w-8 text-primary" />
                    IA para Decisões Melhores
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Insights automáticos detectando padrões</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Análise de cenários (conservador a agressivo)</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Benchmarking contra padrões do mercado</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Projeções de patrimônio futuro</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Análise de aposentadoria personalizada</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Relatórios exportáveis em PDF, CSV, JSON</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-info/10 p-8 shadow-lg">
                  <h4 className="font-bold mb-4">Exemplo de Insight</h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-background border-l-4 border-amber-500">
                      <p className="font-semibold text-amber-700 dark:text-amber-300">⚠️ Alerta de Poupança</p>
                      <p className="text-muted-foreground mt-1">Sua taxa de poupança está 12% abaixo da média. Considere aumentar investimentos.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background border-l-4 border-green-500">
                      <p className="font-semibold text-green-700 dark:text-green-300">💡 Oportunidade</p>
                      <p className="text-muted-foreground mt-1">Sobra de R$ 1.200 no orçamento do mês — bom momento para avaliar um aporte extra.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background border-l-4 border-info">
                      <p className="font-semibold text-info">📈 Projeção</p>
                      <p className="text-muted-foreground mt-1">Em 10 anos, patrimônio pode chegar a R$ 850 mil (cenário moderado).</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* GAMIFICATION SECTION */}
          <motion.section
            className="py-20 border-t border-muted/40"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                <Flame className="h-8 w-8 text-orange-500" />
                Ganhe enquanto aprende
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sistema de gamificação que torna gestão financeira divertida e motivadora
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div variants={fadeIn} className="p-6 rounded-xl border bg-card">
                <Trophy className="h-8 w-8 text-yellow-500 mb-4" />
                <h3 className="font-semibold mb-2">Pontos por Ações</h3>
                <p className="text-sm text-muted-foreground">Ganhe pontos ao registrar aportes, bater metas e manter hábitos consistentes.</p>
              </motion.div>
              <motion.div variants={fadeIn} className="p-6 rounded-xl border bg-card">
                <Flame className="h-8 w-8 text-orange-500 mb-4" />
                <h3 className="font-semibold mb-2">Streaks Diários</h3>
                <p className="text-sm text-muted-foreground">Mantenha sua sequência de dias investindo. Quanto maior, mais bônus acumula.</p>
              </motion.div>
              <motion.div variants={fadeIn} className="p-6 rounded-xl border bg-card">
                <Award className="h-8 w-8 text-purple-500 mb-4" />
                <h3 className="font-semibold mb-2">Badges & Conquistas</h3>
                <p className="text-sm text-muted-foreground">Desbloqueie conquistasúnicas ao atingir marcos e desafios especiais.</p>
              </motion.div>
            </div>
          </motion.section>

          {/* BENEFITS SECTION */}
          <motion.section
            className="py-20 border-t border-muted/40"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Por que escolher Lumify</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeIn}
                  className="flex gap-4 p-6 rounded-xl border bg-card"
                >
                  <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA SECTION */}
          <motion.section
            className="py-20 text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Pronto para transformar suas finanças?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Comece grátis e veja a diferença em seus hábitos financeiros
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    Começar Grátis Agora <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.section>

          {/* FAQ SECTION */}
          <motion.section
            className="py-20 border-t border-muted/40"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl font-bold mb-12 text-center">
              Perguntas frequentes
            </motion.h2>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: 'Lumify é realmente gratuito?',
                  a: 'Sim! Começar é 100% gratuito, sem cartão de crédito. No futuro, ofereceremos planos premium com recursos avançados, mas você nunca será forçado a fazer upgrade.'
                },
                {
                  q: 'Meus dados estão seguros?',
                  a: 'Completamente. Usamos Supabase, um provedor enterprise, com autenticação JWT, encriptação em trânsito e conformidade com LGPD. Seus dados são sempre seus.'
                },
                {
                  q: 'Preciso conectar contas bancárias?',
                  a: 'Não é obrigatório. Você pode registrar transações manualmente ou importar dados via OFX. Nunca acessamos suas contas diretamente.'
                },
                {
                  q: 'Funciona no celular?',
                  a: 'Perfeito! Lumify é mobile-first e responsivo, funcionando perfeitamente em smartphones, tablets e desktops.'
                },
                {
                  q: 'Como funciona a IA?',
                  a: 'A IA analisa seus padrões de gastos, investimentos e metas para gerar insights automáticos, recomendações personalizadas e projeções realistas.'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeIn}
                  className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold mb-2 text-lg">{item.q}</h3>
                  <p className="text-muted-foreground">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* FINAL CTA */}
          <motion.section
            className="py-20 text-center border-t border-muted/40"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeIn}
              className="relative inline-block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-info to-primary blur-2xl opacity-30 rounded-full" />
              <Link to="/register">
                <Button size="lg" className="relative shadow-2xl hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-all">
                  Começar Grátis Agora <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="border-t border-muted/40 bg-muted/20 mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">Lumify</span>
                </div>
                <p className="text-sm text-muted-foreground">Seu controle financeiro simplificado</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Produto</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/login" className="hover:text-foreground transition">Dashboard</Link></li>
                  <li><Link to="/login" className="hover:text-foreground transition">Relatórios</Link></li>
                  <li><Link to="/login" className="hover:text-foreground transition">Investimentos</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition">Sobre</a></li>
                  <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                  <li><a href="#" className="hover:text-foreground transition">Contato</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition">Privacidade</a></li>
                  <li><a href="#" className="hover:text-foreground transition">Termos</a></li>
                  <li><a href="#" className="hover:text-foreground transition">LGPD</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-muted/40 pt-8 text-center text-sm text-muted-foreground">
              <p>© 2026 Lumify. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}