import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Componente que protege a rota de reset de senha
 * Verifica sessionStorage diretamente para garantir que recovery seja detectado
 * mesmo antes do contexto React estar pronto
 */
export function ProtectedResetRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Verificar sessionStorage diretamente (marcado pelo main.jsx)
    const recoveryFromStorage = sessionStorage.getItem('supabase_password_recovery') === 'true';
    
    // Verificar também na URL atual
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const type = hashParams.get('type') || searchParams.get('type');
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const recoveryFromUrl = type === 'recovery' && accessToken;
    
    // Se não há recovery válido e estamos na rota de reset, pode ser acesso direto
    // Mas se há recovery, garantir que permanecemos na página
    if (recoveryFromStorage || recoveryFromUrl) {
      console.log('[ProtectedResetRoute] Recovery detected - allowing access to reset page');
      // Limpar URL se necessário
      if (recoveryFromUrl && (window.location.hash || window.location.search)) {
        window.history.replaceState(null, '', '/reset-password');
      }
    } else if (location.pathname === '/reset-password') {
      // Se estamos em /reset-password mas não há recovery, pode ser acesso direto inválido
      // Mas não vamos redirecionar aqui - deixar a página decidir
      console.log('[ProtectedResetRoute] No recovery detected but on reset page');
    }
  }, [location, navigate]);
  
  return <>{children}</>;
}
