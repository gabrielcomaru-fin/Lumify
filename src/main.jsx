import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

// CRÍTICO: Detectar recovery ANTES de qualquer coisa (antes do Supabase processar os tokens)
// Isso precisa acontecer SINCRONAMENTE antes do React inicializar
(function detectRecoveryEarly() {
  const hash = window.location.hash;
  const search = window.location.search;
  const pathname = window.location.pathname;
  
  console.log('[main.jsx] Early detection - URL:', { pathname, hash: hash.substring(0, 100), search });
  
  // Verificar se é um link de recovery (pode estar no hash ou query params)
  const hashParams = new URLSearchParams(hash.substring(1));
  const searchParams = new URLSearchParams(search);
  
  const type = hashParams.get('type') || searchParams.get('type');
  const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
  
  console.log('[main.jsx] Recovery check:', { type, hasAccessToken: !!accessToken });
  
  if (type === 'recovery' && accessToken) {
    // Marcar no sessionStorage ANTES do Supabase processar
    sessionStorage.setItem('supabase_password_recovery', 'true');
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