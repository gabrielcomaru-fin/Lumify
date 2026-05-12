# Lumify — Sistema de Controle Financeiro Pessoal

Um aplicativo moderno para gerenciamento de finanças pessoais, construído com React, Vite, Tailwind CSS e Supabase.

🌐 **Acesse em produção:** [https://lumify.app.br](https://lumify.app.br)

Este repositório é um **monorepo**:

- **`app/`** — aplicação principal (React + Vite + Supabase + Stripe)
- **`blog/`** — blog institucional em Next.js (SSG, MDX). Documentação: [blog/README.md](blog/README.md)

---

## Funcionalidades

- **Dashboard Inteligente** — KPIs e dicas personalizadas
- **Gestão de Gastos** — despesas por categoria com limites configuráveis
- **Receitas** — controle de entradas financeiras
- **Investimentos** — aportes, metas e projeções
- **Relatórios Avançados** — gráficos e análises detalhadas com exportação (CSV/JSON/PDF)
- **Gamificação** — conquistas e metas para engajamento
- **Planos Pro/Premium** — integração com Stripe para assinaturas
- **Notificações** — alertas de limites e lembretes (browser Notification API)
- **Responsivo** — interface adaptável para mobile e desktop

---

## Tecnologias

| Camada | Stack |
|--------|-------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend/DB | Supabase (PostgreSQL, Auth, RLS, Real-time) |
| Pagamentos | Stripe (Checkout, Webhooks) |
| Deploy | Vercel (App + Funções serverless) |
| UI | Radix UI, Lucide React, Framer Motion |
| Gráficos | Recharts |

---

## Pré-requisitos

- Node.js 20+
- npm
- Conta no [Supabase](https://supabase.com)
- Conta no [Stripe](https://stripe.com) (para funcionalidades de planos)

---

## Configuração do App (`app/`)

### 1. Acesse o diretório do app

```bash
cd app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite `.env` com seus valores do Supabase e Stripe. Consulte `.env.example` para ver todas as variáveis disponíveis.

**Verificar configuração:**

```bash
npm run check:env
```

### 4. Configure o banco de dados

Execute as migrations do Supabase (na ordem) a partir do editor SQL do Supabase ou via CLI:

```bash
# Se usar a CLI do Supabase:
supabase db push
```

Ou aplique manualmente os arquivos em `supabase/migrations/` no editor SQL do painel Supabase.

> As migrations criam as tabelas, políticas RLS, índices e funções necessárias.

### 5. Execute em desenvolvimento

```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`.

---

## Configuração do Blog (`blog/`)

```bash
cd blog
npm install
cp .env.example .env.local   # ajuste as URLs se necessário
npm run dev
```

O blog estará disponível em `http://localhost:3000`. Consulte [blog/README.md](blog/README.md) para mais detalhes.

---

## Scripts — App

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run check:env    # Verifica variáveis de ambiente
npm run health:supabase  # Healthcheck do Supabase
```

---

## Deploy (Vercel)

O deploy é gerenciado pela Vercel como **dois projetos independentes** no mesmo repositório:

| Projeto | Root Directory | Domínio |
|---------|---------------|---------|
| App Lumify | `app` | `lumify.app.br` |
| Blog | `blog` | `blog.lumify.app.br` |

**Configuração do projeto App na Vercel:**

1. **Root Directory:** `app`
2. **Framework Preset:** Vite (detectado automaticamente)
3. **Environment Variables:** importe o `.env` via "Import .env" em *Project → Settings → Environment Variables*
4. As funções serverless em `app/api/` serão detectadas automaticamente

> **Atenção:** O script `npm run deploy` (gh-pages) é para publicações em GitHub Pages **sem** as funções do Stripe. Para produção completa use a Vercel.

---

## Estrutura do Projeto

```
├── app/                     # Aplicação React + Vite
│   ├── api/                 # Funções serverless (Vercel)
│   │   └── stripe/          # Checkout session e webhook
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── contexts/        # Context API (Auth, Finance, Subscription…)
│   │   ├── hooks/           # Hooks customizados
│   │   ├── lib/             # Utilitários e cliente Supabase
│   │   ├── pages/           # Páginas da aplicação
│   │   └── config/          # Configuração de ambiente
│   ├── supabase/
│   │   └── migrations/      # Migrations SQL versionadas
│   ├── .env.example         # Referência de variáveis de ambiente
│   └── vercel.json          # Configuração de deploy e headers HTTP
│
├── blog/                    # Blog Next.js (SSG)
│   ├── app/                 # App Router Next.js
│   ├── content/posts/       # Artigos em MDX
│   ├── components/          # Componentes do blog
│   └── .env.example         # Referência de variáveis de ambiente
│
└── .github/
    └── workflows/
        └── ci.yml           # CI: lint + build (App e Blog)
```

---

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: descrição da mudança'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
