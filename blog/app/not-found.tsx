import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-bold uppercase tracking-widest text-lumify-blue">404</p>
        <h1 className="mt-3 text-2xl font-bold text-lumify-ink sm:text-3xl">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-4 max-w-md text-slate-600">
          O artigo que você procura não existe ou foi movido.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex rounded-lg bg-gradient-to-r from-lumify-navy to-lumify-blue px-6 py-3 text-sm font-semibold text-white shadow-md shadow-lumify-blue/25 transition hover:brightness-110"
        >
          Voltar ao blog
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
