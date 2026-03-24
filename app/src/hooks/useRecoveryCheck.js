import { useMemo } from 'react';

/**
 * Hook que verifica se estamos em modo de recovery de senha
 * Verifica sessionStorage diretamente para garantir detecção antes do contexto React
 */
export function useRecoveryCheck() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    // Verificar sessionStorage (marcado pelo main.jsx antes do React inicializar)
    const recoveryFromStorage = sessionStorage.getItem('supabase_password_recovery') === 'true';
    
    // Verificar também na URL atual (pode ainda estar lá)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const type = hashParams.get('type') || searchParams.get('type');
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const recoveryFromUrl = type === 'recovery' && accessToken;
    
    const isRecovery = recoveryFromStorage || recoveryFromUrl;
    
    if (isRecovery) {
      console.log('[useRecoveryCheck] Recovery detected:', {
        fromStorage: recoveryFromStorage,
        fromUrl: recoveryFromUrl
      });
    }
    
    return isRecovery;
  }, []); // Sem dependências - só verifica uma vez na montagem
}
