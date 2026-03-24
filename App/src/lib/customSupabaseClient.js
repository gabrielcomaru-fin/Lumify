import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/env';

// Usar apenas variáveis de ambiente - SEM FALLBACKS HARDCODED
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '🚨 Supabase configuration missing!\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'See .env.example for reference.'
  );
}

// Verificar se há código na raiz ANTES de criar o cliente
// Se houver, pode ser recovery que foi redirecionado incorretamente
const hasCodeOnRoot = typeof window !== 'undefined' && 
  window.location.pathname === '/' && 
  (window.location.search.includes('code=') || window.location.hash.includes('code='));

// Se há código na raiz, desabilitar detectSessionInUrl temporariamente
// para termos controle sobre quando processar
const detectSessionInUrl = !hasCodeOnRoot;

if (hasCodeOnRoot) {
  console.log('[customSupabaseClient] Code detected on root - disabling auto session detection');
}

// Configurações de cliente otimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: detectSessionInUrl, // Desabilitar se há código na raiz
    flowType: 'pkce', // Mais seguro para SPAs
  },
  global: {
    headers: {
      'X-Client-Info': `${config.app.name}@${config.app.version}`,
    },
  },
  // Cache para melhor performance
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});