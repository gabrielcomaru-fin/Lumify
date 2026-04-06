import Image from "next/image";
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/40 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lumify-blue/40 to-transparent" />
      <div className="mx-auto flex h-[4.25rem] max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo-wordmark.svg"
            alt="Lumify"
            width={140}
            height={42}
            className="h-8 w-auto sm:h-9"
            priority
          />
          <span className="hidden text-[15px] font-semibold tracking-tight text-slate-400 sm:inline sm:border-l sm:border-slate-200 sm:pl-3">
            Blog
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-lumify-navy"
          >
            Artigos
          </Link>
          <a
            href={appNavUrl()}
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-lumify-navy to-lumify-blue px-4 py-2 text-sm font-semibold text-white shadow-md shadow-lumify-blue/25 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumify-blue"
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
    <footer className="mt-24 border-t border-slate-200 bg-white/80 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4 text-center text-sm text-slate-600 sm:px-6">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo-wordmark.svg"
            alt="Lumify"
            width={120}
            height={36}
            className="h-7 w-auto opacity-90"
          />
        </div>
        <p className="max-w-xl mx-auto leading-relaxed">
          Conteúdo educativo. Não constitui recomendação de investimento ou consultoria financeira.
        </p>
        <p className="mt-5">
          <a
            href={APP_URL}
            className="font-semibold text-lumify-navy underline-offset-4 hover:text-lumify-blue hover:underline"
          >
            lumify.app.br
          </a>
          <span className="text-slate-400"> · </span>
          <span className="text-slate-500">
            Blog em {SITE_URL.replace(/^https?:\/\//, "")}
          </span>
        </p>
        <p className="mt-3 text-xs text-slate-400">© {year} Lumify</p>
      </div>
    </footer>
  );
}
