import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">404</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Página não encontrada
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          O artigo que você procura não existe ou foi movido.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Voltar ao blog
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
