// Configuração de variáveis de ambiente
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Lumify',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE,
    // IMPORTANTE: Em produção, configure VITE_REDIRECT_URL_BASE=https://lumify.app.br no .env
    // Fallback: localhost para desenvolvimento, lumify.app.br para produção
    redirectUrlBase: import.meta.env.VITE_REDIRECT_URL_BASE || 
      (import.meta.env.MODE === 'development' 
        ? 'http://localhost:5173' 
        : 'https://lumify.app.br'),
  }
};

// Validação das variáveis obrigatórias
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `⚠️ Missing required environment variables: ${missingVars.join(', ')}\n` +
    'Please check your .env file and ensure all required variables are set.\n' +
    'See .env.example for reference.'
  );
  
  // Em desenvolvimento, permitir continuar com fallback
  if (import.meta.env.MODE === 'development') {
    console.warn('🔧 Running in development mode with fallback configuration...');
  } else {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}
