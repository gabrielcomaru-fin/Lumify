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
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
        <header className="mb-14 text-center sm:mb-16 sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-lumify-blue">
            Lumify Blog
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-lumify-ink sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Educação financeira{" "}
            <span className="text-gradient-lumify">no seu ritmo</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:mx-0">
            Guias práticos para organizar o dinheiro, construir reserva e dar os primeiros passos nos
            investimentos — sempre com linguagem clara e foco em ação.
          </p>
        </header>
        <ul className="space-y-5">
          {posts.map((post) => {
            const dateLabel = new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "medium",
            }).format(new Date(post.date));
            return (
              <li key={post.slug}>
                <article className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50 transition hover:border-lumify-blue/30 hover:shadow-md hover:shadow-lumify-blue/10 sm:p-7">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {dateLabel}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-lumify-ink sm:text-[1.35rem]">
                    <Link
                      href={`/${post.slug}`}
                      className="transition group-hover:text-lumify-navy"
                    >
                      {post.title}
                      <span className="ml-1 inline-block text-lumify-blue opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  </h2>
                  <p className="mt-3 leading-relaxed text-slate-600">{post.description}</p>
                  <Link
                    href={`/${post.slug}`}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-lumify-navy underline-offset-4 hover:text-lumify-blue hover:underline"
                  >
                    Ler artigo
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
