import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  // Traduz mensagens comuns de erro de autenticação do Supabase para PT-BR
  const translateAuthError = useCallback((error) => {
    if (!error) return 'Não foi possível realizar o login.';
    const msg = (error.message || '').toLowerCase();

    if (msg.includes('invalid login credentials')) {
      return 'Credenciais inválidas. Verifique e tente novamente.';
    }
    if (msg.includes('email not confirmed') || msg.includes('email not confirmed')) {
      return 'E-mail não confirmado. Verifique sua caixa de entrada para confirmar.';
    }
    if (msg.includes('user not found')) {
      return 'Usuário não encontrado.';
    }
    if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('too many requests')) {
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Problema de conexão. Verifique sua internet e tente novamente.';
    }
    return error.message || 'Não foi possível realizar o login.';
  }, []);

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // Verificar sessionStorage IMEDIATAMENTE (marcado pelo main.jsx antes do React inicializar)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    const recoveryFlag = sessionStorage.getItem('supabase_password_recovery');
    if (recoveryFlag === 'true') {
      console.log('[AuthContext] Password recovery detected from sessionStorage (set by main.jsx)');
      return true;
    }
    return false;
  });

  const handleSession = useCallback(async (session) => {
    try {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    } catch (error) {
      console.error('Session handling error:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Verificar IMEDIATAMENTE se há tokens de recovery na URL (síncrono, antes de qualquer async)
    const checkRecoveryInUrl = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);
      const type = hashParams.get('type') || searchParams.get('type');
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      
      if (type === 'recovery' && accessToken) {
        setIsPasswordRecovery(true);
        console.log('Password recovery detected IMMEDIATELY from URL');
        return true;
      }
      return false;
    };

    // Verificar recovery na URL ANTES de qualquer outra coisa
    const hasRecoveryInUrl = checkRecoveryInUrl();

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Get session error:', error);
          setLoading(false);
          return;
        }
        
        // Se há recovery na URL e uma sessão foi criada, marcar como recovery
        // Também verificar se estamos na rota de reset (pode indicar recovery recente)
        if (hasRecoveryInUrl && session) {
          setIsPasswordRecovery(true);
          console.log('[AuthContext] Password recovery confirmed with session');
          // Marcar timestamp para verificar depois
          sessionStorage.setItem('recovery_session_time', Date.now().toString());
        } else if (session && window.location.pathname === '/reset-password') {
          // Se há sessão e estamos em /reset-password, pode ser recovery recente
          // Verificar se a sessão foi criada recentemente (últimos 10 segundos)
          const recoveryTime = sessionStorage.getItem('recovery_session_time');
          if (recoveryTime) {
            const timeDiff = Date.now() - parseInt(recoveryTime);
            if (timeDiff < 10000) { // 10 segundos
              setIsPasswordRecovery(true);
              console.log('[AuthContext] Recovery detected from recent session');
            }
          }
        }
        
        handleSession(session);
      } catch (error) {
        console.error('Session initialization error:', error);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Detectar evento de password recovery
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          sessionStorage.setItem('supabase_password_recovery', 'true');
          sessionStorage.setItem('recovery_session_time', Date.now().toString());
          console.log('[AuthContext] ✅ PASSWORD_RECOVERY event detected');
        }
        
        // Se há sessão e estamos em /reset-password, pode ser recovery
        if (session && window.location.pathname === '/reset-password') {
          // Verificar se há recovery na URL (pode ainda estar lá)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const searchParams = new URLSearchParams(window.location.search);
          const type = hashParams.get('type') || searchParams.get('type');
          
          if (type === 'recovery') {
            setIsPasswordRecovery(true);
            sessionStorage.setItem('supabase_password_recovery', 'true');
            sessionStorage.setItem('recovery_session_time', Date.now().toString());
            console.log('[AuthContext] ✅ Recovery detected from URL in auth change');
          } else {
            // Verificar se a sessão foi criada recentemente (últimos 10 segundos)
            const recoveryTime = sessionStorage.getItem('recovery_session_time');
            if (recoveryTime) {
              const timeDiff = Date.now() - parseInt(recoveryTime);
              if (timeDiff < 10000) { // 10 segundos
                setIsPasswordRecovery(true);
                console.log('[AuthContext] ✅ Recovery detected from recent session timestamp');
              }
            }
          }
        }
        
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });

      if (error) {
        console.error('SignUp error:', error);
        toast({
          variant: "destructive",
          title: "Falha no cadastro",
          description: error.message || "Ocorreu um problema ao criar sua conta.",
        });
      } else {
        console.log('SignUp successful:', data.user?.id);
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Enviamos um e-mail de confirmação para você.",
        });
      }

      return { data, error };
    } catch (error) {
      console.error('SignUp network error:', error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet e tente novamente.",
      });
      return { data: null, error };
    }
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('SignIn error:', error);
        toast({
          variant: "destructive",
          title: "Falha no login",
          description: translateAuthError(error),
        });
      } else {
        console.log('SignIn successful:', data.user?.id);
      }

      return { data, error };
    } catch (error) {
      console.error('SignIn network error:', error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Verifique sua conexão com a internet e tente novamente.",
      });
      return { data: null, error };
    }
  }, [toast, translateAuthError]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('SignOut error:', error);
        toast({
          variant: "destructive",
          title: "Falha ao sair",
          description: error.message || "Não foi possível encerrar a sessão.",
        });
      } else {
        console.log('SignOut successful');
      }

      return { error };
    } catch (error) {
      console.error('SignOut network error:', error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Houve um problema ao encerrar a sessão.",
      });
      return { error };
    }
  }, [toast]);

  const resetPassword = useCallback(async (email) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      console.error('Reset password error:', error);
      toast({
        variant: "destructive",
        title: "Falha ao enviar e-mail",
        description: error.message || "Tente novamente mais tarde.",
      });
    } else {
      toast({
        title: "Verifique seu e-mail",
        description: "Enviamos um link para redefinir sua senha.",
      });
    }

    return { error };
  }, [toast]);

  const updatePassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível atualizar a senha",
        description: error.message || "Tente novamente.",
      });
    } else {
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
    }

    return { data, error };
  }, [toast]);

  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
    // Limpar também o sessionStorage
    sessionStorage.removeItem('supabase_password_recovery');
    console.log('[AuthContext] Password recovery cleared');
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isPasswordRecovery,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    clearPasswordRecovery,
  }), [user, session, loading, isPasswordRecovery, signUp, signIn, signOut, resetPassword, updatePassword, clearPasswordRecovery]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { toast } = useToast();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { error, user, session, ...rest } = context;

  // Display login success toast only when a session becomes available
  useEffect(() => {
    if (session && !context.loading) {
       // A simple flag to prevent showing the toast on every re-render/session refresh
      const hasShownLoginToast = sessionStorage.getItem('loginToastShown');
      if (!hasShownLoginToast) {
        toast({
          title: 'Login realizado com sucesso!',
          description: `Bem-vindo de volta, ${user?.user_metadata?.nome || user?.email}!`,
        });
        sessionStorage.setItem('loginToastShown', 'true');
      }
    }
    // On logout, remove the flag
    if (!session) {
      sessionStorage.removeItem('loginToastShown');
    }
  }, [session, user, context.loading, toast]);

  return { user, session, error, ...rest };
};