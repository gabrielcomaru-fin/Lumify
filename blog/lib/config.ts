/**
 * URLs públicas. Sobrescreva em produção via variáveis de ambiente na Vercel.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.lumify.app.br";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://lumify.app.br";
