// Exemplo de configuração de variáveis de ambiente
// Copie este arquivo para .env na raiz do projeto e configure as variáveis

export const envExample = {
  // Configuração do Supabase (OBRIGATÓRIO)
  VITE_SUPABASE_URL: 'https://your-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'your-anon-key-here',
  
  // Configuração da Aplicação
  VITE_APP_NAME: 'NovaFin',
  VITE_APP_VERSION: '1.0.0',
  
  // URL base para redirecionamentos (obrigatório em produção)
  // IMPORTANTE: Atualize com seu domínio de produção
  // Produção: 'https://lumify.app.br'
  VITE_REDIRECT_URL_BASE: 'http://localhost:5173',
  
  // Base path do Vite (opcional, padrão: '/')
  // Use apenas se sua aplicação estiver em um subpath
  // Exemplo: '/app/' se acessar via https://dominio.com/app/
  VITE_BASE_PATH: '/',
  
  // Configurações de desenvolvimento
  NODE_ENV: 'development'
};

// Instruções de configuração:
// 1. Crie um arquivo .env na raiz do projeto
// 2. Copie as variáveis acima para o arquivo .env
// 3. Substitua os valores pelos seus dados reais
// 4. Nunca commite o arquivo .env com dados reais
