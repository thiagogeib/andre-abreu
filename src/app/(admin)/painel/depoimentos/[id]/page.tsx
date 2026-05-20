import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DepoimentoForm } from "../depoimento-form"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const t = await prisma.testimonial.findUnique({ where: { id }, select: { authorName: true } })
  return { title: t ? `Editar — ${t.authorName}` : "Depoimento não encontrado" }
}

export default async function EditDepoimentoPage({ params }: Props) {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/login")

  const { id } = await params
  const t = await prisma.testimonial.findUnique({ where: { id } })
  if (!t) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/painel/depoimentos"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "cursor-pointer")}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Editar depoimento</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.authorName}</p>
        </div>
      </div>

      <DepoimentoForm
        initialData={{
          id: t.id,
          authorName: t.authorName,
          authorRole: t.authorRole,
          company: t.company,
          content: t.content,
          avatarUrl: t.avatarUrl,
          isPublished: t.isPublished,
          order: t.order,
        }}
      />
    </div>
  )
}
