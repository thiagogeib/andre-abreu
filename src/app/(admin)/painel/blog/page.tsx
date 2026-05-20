import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FileText, Plus, Pencil } from "lucide-react"
import type { BlogPostStatus } from "@/generated/prisma"
import { BlogDeleteButton } from "./blog-delete-button"

export const metadata = { title: "Blog" }

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
}

const STATUS_COLORS: Record<BlogPostStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  ARCHIVED: "bg-muted text-muted-foreground/60",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export default async function BlogPage() {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Blog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>
        <Link
          href="/painel/blog/novo"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5 cursor-pointer")}
        >
          <Plus className="size-4" />
          Novo post
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Criado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <FileText className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhum post criado ainda.</p>
                      <Link
                        href="/painel/blog/novo"
                        className={cn(buttonVariants({ size: "sm" }), "mt-3 gap-1.5 cursor-pointer")}
                      >
                        <Plus className="size-4" />
                        Criar primeiro post
                      </Link>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{post.title}</span>
                          <span className="text-xs text-muted-foreground">{post.slug}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={STATUS_COLORS[post.status]}>
                          {STATUS_LABELS[post.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/painel/blog/${post.id}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "cursor-pointer"
                            )}
                            aria-label="Editar post"
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                          <BlogDeleteButton id={post.id} title={post.title} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
