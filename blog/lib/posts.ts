import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  tags?: string[];
  /** Caminho relativo em /public ou URL absoluta para OG */
  heroImage?: string;
  draft?: boolean;
};

export type PostMeta = PostFrontmatter & { slug: string };

export type Post = {
  slug: string;
  frontmatter: PostFrontmatter;
  /** Corpo MDX sem frontmatter */
  body: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function ensurePostsDir(): boolean {
  return fs.existsSync(POSTS_DIR);
}

function parseFileContent(slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  const fm = data as Partial<PostFrontmatter>;
  if (!fm.title || !fm.description || !fm.date || !fm.author) {
    throw new Error(
      `Post "${slug}": frontmatter incompleto (title, description, date, author).`,
    );
  }
  return {
    slug,
    frontmatter: {
      title: fm.title,
      description: fm.description,
      date: fm.date,
      updated: fm.updated,
      author: fm.author,
      tags: fm.tags,
      heroImage: fm.heroImage,
      draft: fm.draft,
    },
    body: content.trim(),
  };
}

export function getAllSlugs(): string[] {
  if (!ensurePostsDir()) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): Post | null {
  if (!ensurePostsDir()) return null;
  const full = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  return parseFileContent(slug, raw);
}

export function getAllPostsMeta(): PostMeta[] {
  const slugs = getAllSlugs();
  const posts: PostMeta[] = [];
  for (const slug of slugs) {
    const full = path.join(POSTS_DIR, `${slug}.mdx`);
    if (!fs.existsSync(full)) continue;
    const raw = fs.readFileSync(full, "utf8");
    const post = parseFileContent(slug, raw);
    if (post.frontmatter.draft) continue;
    posts.push({ slug, ...post.frontmatter });
  }
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts;
}
