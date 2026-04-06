import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { ArticleJsonLd } from "@/components/ArticleJsonLd";
import { getMdxComponents } from "@/components/mdx";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { APP_URL, SITE_URL } from "@/lib/config";
import { getAllPostsMeta, getPostBySlug } from "@/lib/posts";

export const dynamicParams = false;

/** ISR opcional: defina um número (segundos) para revalidar páginas estáticas. */
// export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const metas = getAllPostsMeta();
  return metas.map(({ slug }) => ({ slug }));
}

function ogImageUrl(heroImage: string | undefined): string | undefined {
  if (!heroImage) return undefined;
  if (heroImage.startsWith("http://") || heroImage.startsWith("https://")) {
    return heroImage;
  }
  const base = SITE_URL.replace(/\/$/, "");
  const path = heroImage.startsWith("/") ? heroImage : `/${heroImage}`;
  return `${base}${path}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const { frontmatter } = post;
  const canonical = `${SITE_URL.replace(/\/$/, "")}/${slug}`;
  const ogImage = ogImageUrl(frontmatter.heroImage);

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: frontmatter.title,
      description: frontmatter.description,
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updated ?? frontmatter.date,
      authors: [frontmatter.author],
      siteName: "Lumify Blog",
      locale: "pt_BR",
      ...(ogImage ? { images: [{ url: ogImage, alt: frontmatter.title }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: frontmatter.title,
      description: frontmatter.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: post.body,
    components: getMdxComponents(slug),
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date(post.frontmatter.date));

  const registerUrl = new URL("/register", APP_URL.endsWith("/") ? APP_URL : `${APP_URL}/`);
  registerUrl.searchParams.set("utm_source", "blog");
  registerUrl.searchParams.set("utm_medium", "article");
  registerUrl.searchParams.set("utm_campaign", slug);

  return (
    <>
      <ArticleJsonLd slug={slug} frontmatter={post.frontmatter} />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <article>
          <header className="mb-10 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/40 sm:p-8">
            <p className="text-sm font-medium text-slate-500">
              <time dateTime={post.frontmatter.date}>{formattedDate}</time>
              {post.frontmatter.updated ? (
                <>
                  {" · "}
                  <span>
                    Atualizado em{" "}
                    <time dateTime={post.frontmatter.updated}>
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "medium",
                      }).format(new Date(post.frontmatter.updated))}
                    </time>
                  </span>
                </>
              ) : null}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-lumify-ink sm:text-4xl">
              {post.frontmatter.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              {post.frontmatter.description}
            </p>
            <p className="mt-4 text-sm text-slate-500">Por {post.frontmatter.author}</p>
            {post.frontmatter.tags && post.frontmatter.tags.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {post.frontmatter.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-lumify-muted px-3 py-0.5 text-xs font-semibold text-lumify-navy"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </header>
          <div className="prose prose-slate max-w-none rounded-2xl border border-slate-200/60 bg-white px-6 py-8 prose-headings:scroll-mt-20 prose-headings:text-lumify-ink prose-a:font-medium prose-a:text-lumify-navy prose-a:no-underline hover:prose-a:text-lumify-blue hover:prose-a:underline sm:px-8 sm:py-10">
            {content}
          </div>
          <aside className="not-prose mt-10 rounded-2xl border border-lumify-blue/25 bg-gradient-to-br from-lumify-muted/90 to-white p-6 shadow-sm shadow-lumify-blue/10 sm:p-8">
            <h2 className="text-lg font-semibold text-lumify-ink">
              Coloque o plano em prática
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Use o Lumify para acompanhar gastos, metas e investimentos em um só lugar.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={registerUrl.toString()}
                className="inline-flex rounded-lg bg-gradient-to-r from-lumify-navy to-lumify-blue px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-lumify-blue/20 transition hover:brightness-110"
              >
                Criar conta grátis
              </a>
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-lumify-ink transition hover:border-lumify-blue/40 hover:bg-slate-50"
              >
                Ver mais artigos
              </Link>
            </div>
          </aside>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
