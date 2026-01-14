import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

// Lazy imports
const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const HomeSummaryPage = lazy(() => import('@/pages/HomeSummaryPage').then(m => ({ default: m.HomeSummaryPage })));
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const IncomesPage = lazy(() => import('@/pages/IncomesPage').then(m => ({ default: m.IncomesPage })));
const InvestmentsPage = lazy(() => import('@/pages/InvestmentsPage').then(m => ({ default: m.InvestmentsPage })));
const AccountsPage = lazy(() => import('@/pages/AccountsPage').then(m => ({ default: m.AccountsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const PlansPage = lazy(() => import('@/pages/PlansPage').then(m => ({ default: m.PlansPage })));
const CalculatorPage = lazy(() => import('@/pages/CalculatorPage').then(m => ({ default: m.CalculatorPage })));
const InvestmentProjectionPage = lazy(() => import('@/pages/InvestmentProjectionPage').then(m => ({ default: m.InvestmentProjectionPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const GamificationPage = lazy(() => import('@/pages/GamificationPage').then(m => ({ default: m.GamificationPage })));
const PatrimonyDetailPage = lazy(() => import('@/pages/PatrimonyDetailPage').then(m => ({ default: m.PatrimonyDetailPage })));

import { MainLayout } from '@/components/MainLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedResetRoute } from '@/components/ProtectedResetRoute';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRecoveryCheck } from '@/hooks/useRecoveryCheck';
import { FinanceDataProvider } from '@/contexts/FinanceDataContext';
import { ThemeProvider } from '@/hooks/useTheme';
import { GamificationProvider } from '@/contexts/GamificationContext';
import { Toaster } from '@/components/ui/toaster';

function AppContent() {
  const { user, loading, signOut, isPasswordRecovery } = useAuth();
  
  // Hook que verifica recovery ANTES de qualquer coisa
  const recoveryFromHook = useRecoveryCheck();
  
  // Verificações em tempo real para evitar redirecionamentos indesejados
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // 1. Detectar se há tokens de recovery diretamente na URL (Crítico para evitar o pulo para o dashboard)
  const isRecoveryInUrl = hash.includes('type=recovery') || hash.includes('access_token=') || hash.includes('error_code=otp_expired');
  
  // 2. Consolidar se o app deve estar em modo de recuperação
  const isOnResetPage = pathname === '/reset-password';
  const recoveryTime = typeof window !== 'undefined' ? sessionStorage.getItem('recovery_session_time') : null;
  const recentRecovery = recoveryTime && (Date.now() - parseInt(recoveryTime)) < 60000; // Aumentado para 60s
  
  const isInRecoveryMode = recoveryFromHook || isPasswordRecovery || isRecoveryInUrl || (isOnResetPage && recentRecovery);

  // Se houver qualquer indício de recovery, bloqueamos o redirecionamento automático para o dashboard
  const shouldBlockDashboardRedirect = isInRecoveryMode || isRecoveryInUrl || isOnResetPage;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Lumify - Seu Controle Financeiro Pessoal</title>
        <meta name="description" content="Lumify: controle de despesas, investimentos e metas com dashboards claros e projeções inteligentes." />
      </Helmet>
      
      <ErrorBoundary>
        <Router>
          <FinanceDataProvider>
            <GamificationProvider>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            }>
            <Routes>
              {/* Ajuste: Se houver indício de recovery, não redireciona para o dashboard mesmo com user presente */}
              <Route path="/" element={!user || shouldBlockDashboardRedirect ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
              <Route path="/login" element={!user || shouldBlockDashboardRedirect ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
              <Route path="/register" element={!user || shouldBlockDashboardRedirect ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
              
              <Route path="/reset-password" element={
                <ProtectedResetRoute>
                  <ResetPasswordPage />
                </ProtectedResetRoute>
              } />
              
              <Route element={<MainLayout user={user} onLogout={signOut} />}>
                <Route path="/dashboard" element={user ? <HomeSummaryPage /> : <Navigate to="/login" replace />} />
                <Route path="/resumo" element={user ? <HomeSummaryPage /> : <Navigate to="/login" replace />} />
                <Route path="/gastos" element={user ? <ExpensesPage /> : <Navigate to="/login" replace />} />
                <Route path="/receitas" element={user ? <IncomesPage /> : <Navigate to="/login" replace />} />
                <Route path="/investimentos" element={user ? <InvestmentsPage /> : <Navigate to="/login" replace />} />
                <Route path="/projecao-investimentos" element={user ? <InvestmentProjectionPage /> : <Navigate to="/login" replace />} />
                <Route path="/contas" element={user ? <AccountsPage /> : <Navigate to="/login" replace />} />
                <Route path="/patrimonio" element={user ? <PatrimonyDetailPage /> : <Navigate to="/login" replace />} />
                <Route path="/calculadora" element={user ? <CalculatorPage /> : <Navigate to="/login" replace />} />
                <Route path="/relatorios" element={user ? <ReportsPage /> : <Navigate to="/login" replace />} />
                <Route path="/conquistas" element={user ? <GamificationPage /> : <Navigate to="/login" replace />} />
                <Route path="/configuracoes" element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />
                <Route path="/planos" element={user ? <PlansPage /> : <Navigate to="/login" replace />} />
              </Route>
              
              <Route path="*" element={<Navigate to={user && !shouldBlockDashboardRedirect ? "/dashboard" : "/"} replace />} />
            </Routes>
            </Suspense>
            </GamificationProvider>
          </FinanceDataProvider>
        </Router>
      </ErrorBoundary>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}