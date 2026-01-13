# 🌐 Configuração do Domínio: lumify.app.br

## ✅ Alterações Realizadas no Código

### 1. **Roteador Atualizado** ✅
- **Arquivo:** `src/App.jsx`
- **Mudança:** `HashRouter` → `BrowserRouter`
- **Resultado:** URLs limpas sem `#` (ex: `https://lumify.app.br/dashboard` ao invés de `https://lumify.app.br/#/dashboard`)

### 2. **Configuração Base do Vite** ✅
- **Arquivo:** `vite.config.js`
- **Configuração:** `base: process.env.VITE_BASE_PATH || '/'`
- **Status:** Configurado para domínio raiz (não precisa de subpath)

### 3. **Arquivo .htaccess** ✅
- **Arquivo:** `public/.htaccess`
- **Status:** Já configurado corretamente com `RewriteBase /`
- **Função:** Garante que todas as rotas funcionem corretamente no servidor

---

## 📝 Configurações Necessárias

### 1. **Arquivo .env** ⚠️ AÇÃO NECESSÁRIA

Atualize seu arquivo `.env` na raiz do projeto:

```env
# Configuração do Supabase (obrigatório)
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Configuração da Aplicação
VITE_APP_NAME=Lumify
VITE_APP_VERSION=1.0.0

# URLs de redirecionamento - IMPORTANTE: Atualize para produção
VITE_REDIRECT_URL_BASE=https://lumify.app.br

# Base path (deixe como '/' para domínio raiz)
VITE_BASE_PATH=/
```

---

### 2. **Configuração no Supabase Dashboard** 🚨 CRÍTICO

**Passos obrigatórios:**

1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/settings/auth
2. Na seção **"URL Configuration"**:

   **Site URL:**
   ```
   https://lumify.app.br
   ```

   **Redirect URLs** (adicione cada uma):
   ```
   https://lumify.app.br/reset-password
   https://lumify.app.br/**
   https://lumify.app.br/dashboard
   https://lumify.app.br/login
   https://lumify.app.br/register
   ```

3. Salve as alterações

**⚠️ IMPORTANTE:** Sem essas configurações, autenticação e reset de senha não funcionarão!

---

### 3. **Configuração do Servidor/Hosting**

#### Para Apache (Hostinger, cPanel, etc.)
O arquivo `.htaccess` já está configurado corretamente em `public/.htaccess`. Certifique-se de que:
- O módulo `mod_rewrite` está habilitado
- O arquivo `.htaccess` está na pasta raiz do servidor (ou na pasta `public` se usar build)

#### Para Nginx
Adicione esta configuração ao seu `nginx.conf`:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Para Vercel
Crie um arquivo `vercel.json` na raiz:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Para Netlify
Crie um arquivo `public/_redirects`:

```
/*    /index.html   200
```

---

## 🧪 Testes Após Deploy

### Checklist de Testes:

- [ ] Acessar `https://lumify.app.br` - deve abrir a landing page
- [ ] Acessar `https://lumify.app.br/login` - deve abrir a página de login
- [ ] Fazer login - deve redirecionar para `/dashboard`
- [ ] Navegar entre páginas - URLs devem ser limpas (sem `#`)
- [ ] Testar reset de senha - link do e-mail deve funcionar
- [ ] Testar logout - deve redirecionar corretamente
- [ ] Acessar rotas diretamente (ex: `/gastos`, `/investimentos`) - devem funcionar
- [ ] Verificar console do navegador - não deve haver erros de CORS ou 404

---

## 🔍 Verificações Finais

### URLs Esperadas (todas funcionando):

✅ `https://lumify.app.br` → Landing page ou Dashboard (se logado)
✅ `https://lumify.app.br/login` → Página de login
✅ `https://lumify.app.br/register` → Página de registro
✅ `https://lumify.app.br/dashboard` → Dashboard principal
✅ `https://lumify.app.br/reset-password` → Reset de senha
✅ `https://lumify.app.br/gastos` → Página de gastos
✅ `https://lumify.app.br/investimentos` → Página de investimentos
✅ E todas as outras rotas...

### O que NÃO deve aparecer:

❌ `https://lumify.app.br/#/dashboard` (com hash)
❌ `https://lumify.app.br/lumify/dashboard` (com subpath)
❌ `https://lumify.app.br/NovaFin/dashboard` (path antigo)

---

## 📚 Arquivos Modificados

1. ✅ `src/App.jsx` - Mudado para BrowserRouter
2. ✅ `vite.config.js` - Configurado para base path `/`
3. ✅ `src/config/env.example.js` - Atualizado com domínio
4. ✅ `setup-supabase.js` - Atualizado com domínio
5. ✅ `README.md` - Documentação atualizada
6. ✅ `REVISAO_REDIRECIONAMENTOS_DOMINIO.md` - Revisão completa

---

## 🚀 Próximos Passos

1. **Atualize o arquivo `.env`** com `VITE_REDIRECT_URL_BASE=https://lumify.app.br`
2. **Configure o Supabase** com as URLs permitidas (passo crítico!)
3. **Faça o build:** `npm run build`
4. **Faça o deploy** para seu servidor
5. **Teste todas as rotas** conforme checklist acima

---

## ⚠️ Avisos Importantes

1. **HTTPS obrigatório:** O Supabase requer HTTPS em produção. Certifique-se de que seu certificado SSL está configurado.

2. **Cache do navegador:** Após o deploy, limpe o cache do navegador ou use modo anônimo para testar.

3. **Variáveis de ambiente:** Não commite o arquivo `.env` com dados reais. Use variáveis de ambiente no serviço de hosting.

4. **Build limpo:** Após alterar variáveis de ambiente, faça um novo build (`npm run build`).

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador para erros
2. Verifique as configurações do Supabase
3. Verifique se o `.htaccess` está sendo aplicado
4. Verifique se as variáveis de ambiente estão corretas no servidor

---

**Última atualização:** Configurado para `https://lumify.app.br` na raiz ✅
