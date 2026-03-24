import { SITE_URL } from "@/lib/config";
import type { PostFrontmatter } from "@/lib/posts";

type Props = {
  slug: string;
  frontmatter: PostFrontmatter;
};

export function ArticleJsonLd({ slug, frontmatter }: Props) {
  const url = `${SITE_URL.replace(/\/$/, "")}/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    dateModified: frontmatter.updated ?? frontmatter.date,
    author: {
      "@type": "Person",
      name: frontmatter.author,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    publisher: {
      "@type": "Organization",
      name: "Lumify",
      url: "https://lumify.app.br",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
