import Link from "next/link";
import { APP_URL, SITE_URL } from "@/lib/config";

function appNavUrl(): string {
  const u = new URL("/", APP_URL.endsWith("/") ? APP_URL : `${APP_URL}/`);
  u.searchParams.set("utm_source", "blog");
  u.searchParams.set("utm_medium", "navigation");
  u.searchParams.set("utm_campaign", "site-header");
  return u.toString();
}

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Lumify Blog
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Artigos
          </Link>
          <a
            href={appNavUrl()}
            className="font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Abrir app
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 text-center text-sm text-zinc-600 dark:text-zinc-400 sm:px-6">
        <p>
          Conteúdo educativo. Não constitui recomendação de investimento ou consultoria financeira.
        </p>
        <p className="mt-4">
          <a
            href={APP_URL}
            className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            lumify.app.br
          </a>
          {" · "}
          <span>Blog em {SITE_URL.replace(/^https?:\/\//, "")}</span>
        </p>
        <p className="mt-2 text-zinc-500">© {year} Lumify</p>
      </div>
    </footer>
  );
}
