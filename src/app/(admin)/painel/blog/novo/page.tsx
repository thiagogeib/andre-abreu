import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BlogForm } from "../blog-form"

export const metadata = { title: "Novo post" }

export default async function NovoBlogPostPage() {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

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
          <h1 className="text-xl font-semibold text-foreground">Novo post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Criar artigo para o blog</p>
        </div>
      </div>

      <BlogForm />
    </div>
  )
}
