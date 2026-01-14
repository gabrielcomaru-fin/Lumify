import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

// CRÍTICO: Detectar recovery ANTES de qualquer coisa (antes do Supabase processar os tokens)
// Isso precisa acontecer SINCRONAMENTE antes do React inicializar
(function detectRecoveryEarly() {
  // Salvar URL completa ANTES de qualquer processamento
  const fullUrl = window.location.href;
  const hash = window.location.hash;
  const search = window.location.search;
  const pathname = window.location.pathname;
  
  console.log('[main.jsx] Early detection - Full URL:', fullUrl);
  console.log('[main.jsx] Early detection - Parsed:', { pathname, hash: hash.substring(0, 100), search });
  
  // Verificar se há ERROS na URL primeiro
  const hashParams = new URLSearchParams(hash.substring(1));
  const searchParams = new URLSearchParams(search);
  
  const error = hashParams.get('error') || searchParams.get('error');
  const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
  const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
  
  if (error) {
    // Há um erro na URL - marcar no sessionStorage para tratamento
    sessionStorage.setItem('supabase_auth_error', JSON.stringify({
      error,
      error_code: errorCode,
      error_description: errorDescription
    }));
    console.log('[main.jsx] ⚠️ Auth error detected:', { error, errorCode, errorDescription });
    
    // Se for erro de expiração e estamos em /reset-password, manter na página para mostrar erro
    if (errorCode === 'otp_expired' && pathname === '/reset-password') {
      sessionStorage.setItem('supabase_password_recovery_error', 'expired');
    }
    return; // Não processar recovery se há erro
  }
  
  // Verificar se é um link de recovery válido
  const type = hashParams.get('type') || searchParams.get('type');
  const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
  
  console.log('[main.jsx] Recovery check:', { type, hasAccessToken: !!accessToken, pathname });
  
  // Se estamos em /reset-password OU há tokens de recovery, marcar como recovery
  if ((type === 'recovery' && accessToken) || (pathname === '/reset-password' && (hash.includes('type=recovery') || search.includes('type=recovery')))) {
    // Marcar no sessionStorage ANTES do Supabase processar
    sessionStorage.setItem('supabase_password_recovery', 'true');
    sessionStorage.setItem('recovery_session_time', Date.now().toString());
    // Salvar URL completa para referência
    sessionStorage.setItem('recovery_original_url', fullUrl);
    console.log('[main.jsx] ✅ Password recovery detected EARLY - marked in sessionStorage');
  } else {
    console.log('[main.jsx] ❌ No recovery detected');
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);