import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BlogForm } from "../blog-form"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { title: true } })
  return { title: post ? `Editar — ${post.title}` : "Post não encontrado" }
}

export default async function EditBlogPostPage({ params }: Props) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const { id } = await params
  const post = await prisma.blogPost.findUnique({ where: { id } })
  if (!post) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/painel/blog"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "cursor-pointer")}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Editar post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{post.title}</p>
        </div>
      </div>

      <BlogForm
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverUrl: post.coverUrl,
          status: post.status,
          tags: post.tags,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
        }}
      />
    </div>
  )
}
