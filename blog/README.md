# Lumify Blog

Site institucional de conteúdo (educação financeira) em **Next.js 15** (App Router), **TypeScript** e **Tailwind CSS**. Posts em **MDX** versionados em `content/posts/`.

## Requisitos

- Node.js 18+

## Desenvolvimento

```bash
cd blog
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

O build gera páginas de post com **SSG** (`generateStaticParams`). Não há carregamento do corpo do artigo via `fetch` no cliente.

## Novos posts

1. Crie `content/posts/<slug>.mdx` (o slug da URL será exatamente `<slug>`).
2. Preencha o frontmatter: `title`, `description`, `date`, `author` (obrigatórios); opcionais: `updated`, `tags`, `heroImage`, `draft: true`.
3. No MDX, use o componente `<BlogCTA hrefPath="/rota-no-app" label="Texto do botão" />` para CTAs com UTMs corretos.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` se precisar sobrescrever URLs em desenvolvimento.

| Variável | Descrição |
| -------- | --------- |
| `NEXT_PUBLIC_SITE_URL` | URL canônica do blog (ex.: `https://blog.lumify.app.br`) |
| `NEXT_PUBLIC_APP_URL` | URL do app Lumify para CTAs (ex.: `https://lumify.app.br`) |

## Deploy na Vercel (monorepo)

Use **dois projetos** no mesmo repositório Git:

| Projeto | Root Directory | Domínio |
| ------- | -------------- | ------- |
| App Lumify | `app` | `lumify.app.br` |
| Blog | `blog` | `blog.lumify.app.br` |

No projeto do blog:

1. **Root Directory:** `blog`
2. **Framework Preset:** Next.js (detectado automaticamente)
3. **Environment Variables:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`
4. **Domínios:** adicione `blog.lumify.app.br` e configure no DNS um **CNAME** para o destino indicado pela Vercel

## ISR (opcional)

Em `app/[slug]/page.tsx` há um comentário com `revalidate`. Descomente e defina um intervalo em segundos se quiser revalidação incremental sem novo deploy completo.
