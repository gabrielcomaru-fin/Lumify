# 🔐 Solução para Reset de Senha

## Problema Identificado

O Supabase está redirecionando para `/?code=...` ao invés de `/reset-password?code=...` quando o usuário clica no link de reset de senha.

## ✅ Solução Implementada

### 1. **Interceptação no `main.jsx`**
- Detecta código na raiz (`/?code=...`)
- Redireciona IMEDIATAMENTE para `/reset-password?code=...`
- Marca recovery no sessionStorage antes do Supabase processar

### 2. **Detecção no `SupabaseAuthContext`**
- Captura evento `PASSWORD_RECOVERY`
- Verifica sessionStorage e timestamps
- Redireciona se necessário quando detecta código na raiz

### 3. **Validação na `ResetPasswordPage`**
- Aceita recovery via código (PKCE flow)
- Mostra mensagem de erro se link expirar
- Valida antes de permitir alteração

## 🔧 Configuração Necessária no Supabase

O problema pode estar na configuração do Supabase. Verifique:

1. **Site URL** deve ser: `https://lumify.app.br`
2. **Redirect URLs** deve incluir: `https://lumify.app.br/reset-password`
3. **Email Template** deve usar `{{ .ConfirmationURL }}`

## 🐛 Se Ainda Não Funcionar

O problema pode ser que o Supabase está ignorando o `redirectTo` e usando a Site URL como fallback. 

**Solução alternativa:** Desabilitar PKCE temporariamente ou usar um fluxo diferente.

Teste novamente com um link novo e verifique se o redirecionamento acontece corretamente.
