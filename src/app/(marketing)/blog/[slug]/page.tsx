import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { marked } from "marked"
import sanitizeHtml from "sanitize-html"
import { ArrowLeft, Calendar, Tag } from "lucide-react"
import type { Metadata } from "next"

export const revalidate = 1800

const NAVY = "oklch(0.30 0.075 248)"
const NAVY_DEEP = "oklch(0.18 0.05 248)"
const GOLD = "oklch(0.74 0.14 81)"

function formatDate(date: Date | null) {
  if (!date) return ""
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, metaTitle: true, metaDescription: true, excerpt: true, coverUrl: true },
  })
  if (!post) return { title: "Artigo não encontrado" }

  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    openGraph: post.coverUrl ? { images: [post.coverUrl] } : undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
  })

  if (!post) notFound()

  const rawHtml = await marked(post.content, { breaks: true })
  const html = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3"]),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "class"] },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="py-20" style={{ background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)` }}>
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao blog
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-5">
            {post.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded" style={{ background: `${GOLD}20`, color: GOLD }}>
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {post.publishedAt && (
              <span className="inline-flex items-center gap-1 text-xs text-white/40">
                <Calendar className="w-3 h-3" />
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">{post.title}</h1>

          {post.excerpt && (
            <p className="text-white/60 mt-4 text-lg leading-relaxed max-w-2xl">{post.excerpt}</p>
          )}
        </div>
      </div>

      {/* Cover image */}
      {post.coverUrl && (
        <div className="max-w-3xl mx-auto px-6 -mt-8">
          <img
            src={post.coverUrl}
            alt={post.title}
            className="w-full h-64 object-cover rounded-xl shadow-xl"
          />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        <div
          className="prose prose-slate prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-slate-800
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-800
            prose-blockquote:border-l-4 prose-blockquote:italic prose-blockquote:text-slate-500
            prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-code:text-sm
            prose-img:rounded-xl"
          style={{ "--tw-prose-links": NAVY } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: NAVY }}
          >
            <ArrowLeft className="w-4 h-4" />
            Todos os artigos
          </Link>
          <Link
            href="/#contato"
            className="inline-flex items-center gap-2 px-6 h-10 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: GOLD, color: NAVY_DEEP }}
          >
            Falar com André
          </Link>
        </div>
      </article>
    </div>
  )
}
