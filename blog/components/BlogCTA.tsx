import { APP_URL } from "@/lib/config";

export type BlogCTAProps = {
  /** Slug do artigo no blog (utm_campaign). Injetado pelo mapa MDX, não use no .mdx. */
  slug: string;
  /** Caminho no app Lumify, ex. /register ou /gastos */
  hrefPath?: string;
  label?: string;
};

function buildAppUrl(slug: string, hrefPath: string): string {
  const path = hrefPath.startsWith("/") ? hrefPath : `/${hrefPath}`;
  const u = new URL(path, APP_URL.endsWith("/") ? APP_URL : `${APP_URL}/`);
  u.searchParams.set("utm_source", "blog");
  u.searchParams.set("utm_medium", "article");
  u.searchParams.set("utm_campaign", slug);
  return u.toString();
}

/**
 * CTA reutilizável: sempre aponta para lumify.app.br com UTMs fixos e campaign = slug do post.
 */
export function BlogCTA({
  slug,
  hrefPath = "/register",
  label = "Experimente o Lumify grátis",
}: BlogCTAProps) {
  const href = buildAppUrl(slug, hrefPath);

  return (
    <a
      href={href}
      className="not-prose inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-lumify-navy to-lumify-blue px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-lumify-blue/25 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumify-blue"
    >
      {label}
    </a>
  );
}
