import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { ArrowLeft, BookOpen, ArrowRight } from "lucide-react"

export const revalidate = 1800

export const metadata = {
  title: "Blog — André Abreu | Aviação Corporativa",
  description: "Artigos sobre liderança, comunicação, gestão de crise e performance humana baseados em décadas de experiência na aviação.",
}

const NAVY = "oklch(0.30 0.075 248)"
const NAVY_DEEP = "oklch(0.18 0.05 248)"
const GOLD = "oklch(0.74 0.14 81)"

function formatDate(date: Date | null) {
  if (!date) return ""
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date))
}

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: true,
      coverUrl: true,
      publishedAt: true,
    },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="py-20" style={{ background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)` }}>
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors mb-8 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Conteúdo que aterra</h1>
          <p className="text-white/60 mt-4 max-w-xl">
            Aviação como laboratório de alta performance — traduzida para o mundo corporativo.
          </p>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum artigo publicado ainda.</p>
            <Link href="/" className="inline-flex items-center gap-2 mt-6 text-sm font-semibold" style={{ color: NAVY }}>
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {posts.map((post, i) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col sm:flex-row gap-6 cursor-pointer">
                <div
                  className="w-full sm:w-48 h-36 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${NAVY_DEEP}, ${NAVY})` }}
                >
                  {post.coverUrl ? (
                    <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-white opacity-20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: `${GOLD}15`, color: NAVY }}>
                        {tag}
                      </span>
                    ))}
                    {post.publishedAt && (
                      <span className="text-xs text-slate-400">{formatDate(post.publishedAt)}</span>
                    )}
                  </div>
                  <h2 className="font-bold text-xl leading-snug mb-2 group-hover:underline" style={{ color: NAVY }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                  )}
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: NAVY }}>
                    Ler artigo <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
