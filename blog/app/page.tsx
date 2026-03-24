import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SITE_URL } from "@/lib/config";
import { getAllPostsMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: {
    default: "Lumify Blog — Educação financeira e investimentos",
    template: "%s | Lumify Blog",
  },
  description:
    "Artigos sobre orçamento pessoal, reserva de emergência, investimentos para iniciantes e hábitos financeiros. Conteúdo educativo com foco em organização.",
  openGraph: {
    title: "Lumify Blog — Educação financeira e investimentos",
    description:
      "Artigos sobre orçamento, reserva de emergência e investimentos. Conteúdo educativo.",
    url: SITE_URL,
    siteName: "Lumify Blog",
    locale: "pt_BR",
    type: "website",
  },
};

export default function HomePage() {
  const posts = getAllPostsMeta();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Educação financeira no seu ritmo
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
            Guias práticos para organizar o dinheiro, construir reserva e dar os primeiros passos nos
            investimentos — sempre com linguagem clara e foco em ação.
          </p>
        </header>
        <ul className="space-y-10">
          {posts.map((post) => {
            const dateLabel = new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "medium",
            }).format(new Date(post.date));
            return (
              <li key={post.slug}>
                <article>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{dateLabel}</p>
                  <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    <Link
                      href={`/${post.slug}`}
                      className="hover:text-emerald-700 dark:hover:text-emerald-400"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-300">{post.description}</p>
                  <Link
                    href={`/${post.slug}`}
                    className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    Ler artigo →
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
