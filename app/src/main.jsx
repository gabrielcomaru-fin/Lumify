import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

const isDev = import.meta.env.DEV;

// Detectar recovery ANTES de qualquer coisa (antes do Supabase processar os tokens).
// Precisa acontecer sincronamente antes do React inicializar.
(function detectRecoveryEarly() {
  const fullUrl = window.location.href;
  const hash = window.location.hash;
  const search = window.location.search;
  const pathname = window.location.pathname;

  const hashParams = new URLSearchParams(hash.substring(1));
  const searchParams = new URLSearchParams(search);

  const error = hashParams.get('error') || searchParams.get('error');
  const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
  const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

  if (error) {
    sessionStorage.setItem('supabase_auth_error', JSON.stringify({
      error,
      error_code: errorCode,
      error_description: errorDescription
    }));
    if (isDev) console.debug('[auth] Error in URL params detected:', { error, errorCode });
    if (errorCode === 'otp_expired' && pathname === '/reset-password') {
      sessionStorage.setItem('supabase_password_recovery_error', 'expired');
    }
    return;
  }

  const code = hashParams.get('code') || searchParams.get('code');
  const type = hashParams.get('type') || searchParams.get('type');
  const accessToken = hashParams.get('access_token') || searchParams.get('access_token');

  // Se há código na raiz, redirecionar para /reset-password imediatamente.
  // O Supabase pode redirecionar para / em vez de /reset-password dependendo da config.
  if (code && pathname === '/') {
    sessionStorage.setItem('supabase_password_recovery', 'true');
    sessionStorage.setItem('recovery_session_time', Date.now().toString());
    sessionStorage.setItem('recovery_code', code);
    sessionStorage.setItem('recovery_original_url', fullUrl);
    window.location.replace(`/reset-password?code=${code}`);
    return;
  }

  if ((type === 'recovery' && accessToken) || (pathname === '/reset-password' && (code || hash.includes('type=recovery') || search.includes('type=recovery')))) {
    sessionStorage.setItem('supabase_password_recovery', 'true');
    sessionStorage.setItem('recovery_session_time', Date.now().toString());
    if (code) sessionStorage.setItem('recovery_code', code);
    sessionStorage.setItem('recovery_original_url', fullUrl);
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
