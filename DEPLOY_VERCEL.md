# 🚀 Guia de Deploy na Vercel - Lumify

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Projeto Supabase configurado
- Domínio `lumify.app.br` configurado

---

## 🔧 Configuração do Projeto

### 1. Arquivo `vercel.json` ✅

O arquivo `vercel.json` já foi criado com todas as configurações necessárias:
- ✅ Rewrites para SPA (Single Page Application)
- ✅ Headers de segurança
- ✅ Cache otimizado
- ✅ Configurações de build

---

## 📝 Passo a Passo do Deploy

### Passo 1: Conectar Repositório

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Importe seu repositório Git
4. Selecione o repositório do Lumify

### Passo 2: Configurar Build Settings

A Vercel detectará automaticamente que é um projeto Vite. Verifique:

- **Framework Preset:** Vite
- **Build Command:** `npm run build` (automático)
- **Output Directory:** `dist` (automático)
- **Install Command:** `npm install` (automático)
- **Root Directory:** `./` (raiz do projeto)

### Passo 3: Configurar Variáveis de Ambiente ⚠️ CRÍTICO

Na seção **"Environment Variables"**, adicione:

#### Variáveis Obrigatórias:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

#### Variáveis de Configuração:

```env
VITE_REDIRECT_URL_BASE=https://lumify.app.br
VITE_BASE_PATH=/
VITE_APP_NAME=Lumify
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- Configure essas variáveis para **Production**, **Preview** e **Development**
- Use os valores reais do seu Supabase
- Não commite essas variáveis no código

### Passo 4: Configurar Domínio

1. Após o primeiro deploy, vá em **Settings > Domains**
2. Adicione o domínio: `lumify.app.br`
3. Configure os registros DNS conforme instruções da Vercel:
   - **Tipo:** CNAME ou A
   - **Nome:** `lumify.app.br` ou `@`
   - **Valor:** fornecido pela Vercel

### Passo 5: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Acesse `https://lumify.app.br` após o deploy

---

## 🔐 Configuração de Segurança

### Headers Configurados

O `vercel.json` já inclui headers de segurança:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy configurado

### Cache Otimizado

- Assets estáticos: cache de 1 ano
- HTML: sem cache (sempre atualizado)
- Imagens e fontes: cache otimizado

---

## 🔄 Deploys Automáticos

A Vercel faz deploy automático quando:
- ✅ Push para branch `main` → Deploy em produção
- ✅ Push para outras branches → Preview deploy
- ✅ Pull Requests → Preview deploy automático

---

## 🧪 Testes Após Deploy

### Checklist:

- [ ] Acessar `https://lumify.app.br` - deve abrir a landing page
- [ ] Testar login/logout
- [ ] Navegar entre páginas (URLs sem `#`)
- [ ] Testar reset de senha
- [ ] Verificar console do navegador (sem erros)
- [ ] Verificar se assets estão carregando (CSS, JS, imagens)
- [ ] Testar em diferentes dispositivos

---

## 🐛 Troubleshooting

### Problema: Página em branco após deploy

**Solução:**
1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique o console do navegador para erros
3. Verifique os logs do build na Vercel

### Problema: Rotas não funcionam (404)

**Solução:**
- O `vercel.json` já está configurado com rewrites
- Verifique se o arquivo está na raiz do projeto
- Verifique se o `outputDirectory` está como `dist`

### Problema: Erros de CORS ou Supabase

**Solução:**
1. Verifique se `VITE_REDIRECT_URL_BASE` está configurado corretamente
2. Configure as URLs permitidas no Supabase Dashboard:
   - Site URL: `https://lumify.app.br`
   - Redirect URLs: `https://lumify.app.br/**`

### Problema: Variáveis de ambiente não funcionam

**Solução:**
1. Verifique se as variáveis começam com `VITE_`
2. Faça um novo build após adicionar variáveis
3. Verifique se está usando `import.meta.env.VITE_*` no código

---

## 📊 Monitoramento

### Logs

- Acesse o projeto na Vercel
- Vá em **Deployments** > Selecione um deploy > **View Function Logs**

### Analytics

- Ative Vercel Analytics no projeto para monitorar performance
- Configure alertas para erros

---

## 🔄 Atualizações Futuras

Para atualizar a aplicação:

1. Faça push para o repositório Git
2. A Vercel fará deploy automático
3. Ou faça deploy manual pelo painel da Vercel

---

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/docs/frameworks/vite)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ Checklist Final

- [ ] Repositório conectado à Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio `lumify.app.br` configurado
- [ ] DNS configurado corretamente
- [ ] Primeiro deploy realizado
- [ ] Testes realizados
- [ ] Supabase configurado com URLs permitidas

---

**Última atualização:** Configurado para `https://lumify.app.br` ✅
