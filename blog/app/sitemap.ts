import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getAllPostsMeta } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");
  const posts = getAllPostsMeta();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...posts.map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.updated ? new Date(p.updated) : new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  return entries;
}
