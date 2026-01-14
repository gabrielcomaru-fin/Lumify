import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function ResetPasswordPage() {
  const { updatePassword, isPasswordRecovery, user, loading, clearPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isValidRecovery, setIsValidRecovery] = useState(false);

  // Verificar se é um link válido de recovery
  useEffect(() => {
    // Verificar PRIMEIRO o sessionStorage (marcado pelo main.jsx ANTES do React inicializar)
    const recoveryFromStorage = sessionStorage.getItem('supabase_password_recovery') === 'true';
    
    // Verificar também na URL (pode ainda estar lá)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const type = hashParams.get('type') || searchParams.get('type');
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const recoveryFromUrl = type === 'recovery' && accessToken;
    
    console.log('[ResetPasswordPage] Checking recovery:', { 
      recoveryFromStorage, 
      recoveryFromUrl, 
      isPasswordRecovery, 
      user: !!user, 
      loading 
    });
    
    // Se há recovery no sessionStorage OU na URL, marcar como válido IMEDIATAMENTE
    if (recoveryFromStorage || recoveryFromUrl) {
      setIsValidRecovery(true);
      console.log('[ResetPasswordPage] Recovery VALID - from', recoveryFromStorage ? 'sessionStorage' : 'URL');
      
      // Limpar a URL dos tokens se ainda existirem
      if (window.location.hash && (hashParams.has('type') || hashParams.has('access_token'))) {
        window.history.replaceState(null, '', window.location.pathname);
      } else if (searchParams.has('type') || searchParams.has('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return; // Não fazer mais verificações
    }

    if (loading) return;

    // Verificar se é um recovery válido através do contexto
    if (isPasswordRecovery && user) {
      setIsValidRecovery(true);
      console.log('[ResetPasswordPage] Recovery VALID - from context');
    } else if (!loading) {
      // Se não é um recovery válido e não está carregando, verificar se deve redirecionar
      if (!isPasswordRecovery && user) {
        // Usuário autenticado mas não veio de recovery - redirecionar para dashboard
        console.log('[ResetPasswordPage] User authenticated but NOT recovery - redirecting to dashboard');
        navigate('/dashboard');
      } else if (!user && !isPasswordRecovery) {
        // Sem usuário e sem recovery - link inválido
        console.log('[ResetPasswordPage] No user and no recovery - redirecting to login');
        toast({
          variant: "destructive",
          title: "Link inválido",
          description: "Este link de redefinição de senha não é válido ou já foi usado.",
        });
        navigate('/login');
      }
    }
  }, [loading, isPasswordRecovery, user, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidRecovery) {
      toast({
        variant: "destructive",
        title: "Link inválido",
        description: "Este link de redefinição de senha não é válido.",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: "A senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);
    
    if (!error) {
      // Limpar o estado de recovery após sucesso
      clearPasswordRecovery();
      // Redirecionar para login após alguns segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  // Mostrar loading enquanto verifica
  if (loading || !isValidRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Helmet>
          <title>Redefinir senha - Lumify</title>
        </Helmet>
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {loading ? 'Verificando link...' : 'Carregando...'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Helmet>
        <title>Redefinir senha - Lumify</title>
      </Helmet>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>Defina sua nova senha para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar nova senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button disabled={submitting || !isValidRecovery} type="submit" className="w-full">
                {submitting ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


