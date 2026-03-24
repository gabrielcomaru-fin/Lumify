# Lumify - Sistema de Controle Financeiro Pessoal

Um aplicativo moderno para gerenciamento de finanças pessoais, construído com React, Vite, Tailwind CSS e Supabase.

🌐 **Acesse em produção:** [https://lumify.app.br](https://lumify.app.br)

Este repositório é um **monorepo**:

- **`app/`** — aplicação principal (React + Vite)
- **`blog/`** — blog em Next.js (SSG, MDX). Documentação: [blog/README.md](blog/README.md)

## 🚀 Funcionalidades

- **Dashboard Inteligente**: KPIs relevantes e dicas personalizadas
- **Gestão de Gastos**: Controle de despesas por categoria com limites
- **Investimentos**: Acompanhamento de aportes e metas
- **Relatórios Avançados**: Gráficos e análises detalhadas
- **Exportação de Dados**: CSV e JSON
- **Notificações Push**: Lembretes e alertas personalizados
- **Responsivo**: Interface adaptável para mobile e desktop
- **Cache Inteligente**: Performance otimizada com cache de queries

## 🛠️ Tecnologias

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: Radix UI, Lucide React
- **Charts**: Recharts
- **Animações**: Framer Motion
- **Data**: date-fns para manipulação de datas

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## ⚙️ Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Lumify
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

**Opção 1: Configuração Automática (Recomendado)**
```bash
npm run setup:supabase
```

**Opção 2: Configuração Manual**

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_APP_NAME=NovaFin
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# URLs de redirecionamento
# IMPORTANTE: Atualize com seu domínio de produção antes do deploy
# Produção: VITE_REDIRECT_URL_BASE=https://lumify.app.br
# Desenvolvimento: VITE_REDIRECT_URL_BASE=http://localhost:5173
VITE_REDIRECT_URL_BASE=http://localhost:5173

# Base path do Vite (opcional, padrão: '/')
# Use apenas se sua aplicação estiver em um subpath (ex: '/app/')
VITE_BASE_PATH=/
```

**Como obter as credenciais do Supabase:**

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > API
4. Copie a URL e a chave anônima

**Verificar configuração:**
```bash
npm run check:env
```

**Deploy (Vercel ou outro host) – uma única vez:**  
Mantenha todas as variáveis no `.env`. Na Vercel: **Project → Settings → Environment Variables** → use **"Import .env"** (ou cole o conteúdo do `.env` em lote). Assim você sobe tudo de uma vez e, ao trocar de hospedagem, basta importar o mesmo `.env` no novo painel.

### 4. Configure o banco de dados

Execute os seguintes comandos SQL no editor SQL do Supabase:

```sql
-- Tabela de categorias
CREATE TABLE categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('gasto', 'investimento')),
  limite DECIMAL(10,2),
  cor VARCHAR(7),
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de gastos
CREATE TABLE gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  pago BOOLEAN DEFAULT FALSE,
  categoria_id UUID REFERENCES categorias(id),
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de investimentos
CREATE TABLE investimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao VARCHAR(255),
  valor_aporte DECIMAL(10,2) NOT NULL,
  saldo_total DECIMAL(10,2),
  data DATE NOT NULL,
  categoria_id UUID REFERENCES categorias(id),
  instituicao_id UUID REFERENCES contas_bancarias(id),
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas bancárias
CREATE TABLE contas_bancarias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50),
  saldo DECIMAL(10,2) DEFAULT 0,
  descricao TEXT,
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de metas de investimento
CREATE TABLE metas_investimento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_mensal DECIMAL(10,2) NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança (RLS)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_investimento ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias
CREATE POLICY "Users can view their own categories" ON categorias
  FOR SELECT USING (usuario_id = auth.uid() OR usuario_id IS NULL);

CREATE POLICY "Users can insert their own categories" ON categorias
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update their own categories" ON categorias
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Users can delete their own categories" ON categorias
  FOR DELETE USING (usuario_id = auth.uid());

-- Políticas para gastos
CREATE POLICY "Users can view their own expenses" ON gastos
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can insert their own expenses" ON gastos
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update their own expenses" ON gastos
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Users can delete their own expenses" ON gastos
  FOR DELETE USING (usuario_id = auth.uid());

-- Políticas para investimentos
CREATE POLICY "Users can view their own investments" ON investimentos
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can insert their own investments" ON investimentos
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update their own investments" ON investimentos
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Users can delete their own investments" ON investimentos
  FOR DELETE USING (usuario_id = auth.uid());

-- Políticas para contas bancárias
CREATE POLICY "Users can view their own accounts" ON contas_bancarias
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can insert their own accounts" ON contas_bancarias
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update their own accounts" ON contas_bancarias
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Users can delete their own accounts" ON contas_bancarias
  FOR DELETE USING (usuario_id = auth.uid());

-- Políticas para metas de investimento
CREATE POLICY "Users can view their own investment goals" ON metas_investimento
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can insert their own investment goals" ON metas_investimento
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update their own investment goals" ON metas_investimento
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Users can delete their own investment goals" ON metas_investimento
  FOR DELETE USING (usuario_id = auth.uid());
```

### 5. Execute o projeto

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 📱 Funcionalidades Principais

### Dashboard
- Visão geral das finanças
- KPIs principais (gastos, investimentos, taxa de poupança)
- Progresso das metas
- Dicas financeiras personalizadas

### Gestão de Gastos
- Cadastro de despesas por categoria
- Controle de status (pago/pendente)
- Limites por categoria
- Filtros por período

### Investimentos
- Registro de aportes
- Acompanhamento de metas
- Projeções de crescimento
- Histórico de investimentos

### Relatórios
- Gráficos de tendências
- Análise por categoria
- Comparações mensais
- Exportação de dados

### Notificações
- Alertas de limites de gastos
- Lembretes de metas
- Dicas financeiras
- Contas pendentes

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Preview do build de produção
npm run deploy       # Deploy para GitHub Pages
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de UI base
│   ├── charts/         # Componentes de gráficos
│   └── ...
├── contexts/           # Contextos React
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
└── main.jsx           # Ponto de entrada
```

## 🚀 Deploy

### GitHub Pages
```bash
npm run deploy
```

### Vercel/Netlify
1. Conecte seu repositório
2. Configure as variáveis de ambiente
3. Deploy automático

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se as variáveis de ambiente estão configuradas corretamente
2. Confirme se o banco de dados foi configurado com as tabelas e políticas
3. Abra uma issue no GitHub

## 🔄 Atualizações Recentes

- ✅ Sistema de cache para otimização de performance
- ✅ Tratamento de erros robusto
- ✅ Loading states consistentes
- ✅ Responsividade mobile melhorada
- ✅ Novos gráficos e relatórios
- ✅ Sistema de exportação de dados
- ✅ Notificações push
- ✅ Variáveis de ambiente configuráveis
